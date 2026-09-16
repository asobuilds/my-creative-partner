import bpy, json, sys, os, math
from mathutils import Vector

def clear():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for b in list(bpy.data.meshes): bpy.data.meshes.remove(b)
    for b in list(bpy.data.materials): bpy.data.materials.remove(b)
    for b in list(bpy.data.lights): bpy.data.lights.remove(b)
    for b in list(bpy.data.cameras): bpy.data.cameras.remove(b)

def hex_rgb(h):
    h = str(h).lstrip('#')
    if len(h) != 6:
        h = '00f0ff'
    try:
        return tuple(int(h[i:i+2], 16)/255.0 for i in (0,2,4))
    except:
        return (0.0, 0.94, 1.0)

def srgb_to_linear(c):
    return tuple(((v+0.055)/1.055)**2.4 if v > 0.04045 else v/12.92 for v in c)

def make_material(name, col, em, rough, metal):
    mat = bpy.data.materials.new(name=name + '_mat')
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    lin = srgb_to_linear(col)
    bsdf.inputs['Base Color'].default_value = (lin[0], lin[1], lin[2], 1.0)
    try:
        bsdf.inputs['Emission Color'].default_value = (lin[0], lin[1], lin[2], 1.0)
    except KeyError:
        pass
    try:
        bsdf.inputs['Emission Strength'].default_value = float(em)
    except KeyError:
        pass
    bsdf.inputs['Roughness'].default_value = max(0.05, min(1.0, float(rough)))
    bsdf.inputs['Metallic'].default_value = max(0.0, min(1.0, float(metal)))
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat

def build(o):
    kind = o.get('kind', 'sphere')
    pos = o.get('position', [0, 1, 0])
    sc = float(o.get('scale', 1.0))
    name = o.get('id', 'obj')
    col = hex_rgb(o.get('color', '#00f0ff'))
    em = float(o.get('emissive', 0.3))
    rough = float(o.get('roughness', 0.35))
    metal = float(o.get('metalness', 0.4))

    if kind == 'sphere':
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.6*sc, segments=48, ring_count=24, location=pos)
        bpy.ops.object.shade_smooth()
    elif kind == 'torus':
        bpy.ops.mesh.primitive_torus_add(major_radius=0.5*sc, minor_radius=0.18*sc, major_segments=64, minor_segments=16, location=pos)
        bpy.ops.object.shade_smooth()
    elif kind == 'cylinder':
        bpy.ops.mesh.primitive_cylinder_add(radius=0.4*sc, depth=1.2*sc, vertices=48, location=pos)
        bpy.ops.object.shade_smooth()
    elif kind == 'cone':
        bpy.ops.mesh.primitive_cone_add(radius1=0.5*sc, depth=1.2*sc, vertices=48, location=pos)
        bpy.ops.object.shade_smooth()
    elif kind == 'octahedron':
        bpy.ops.mesh.primitive_solid_add(source='4', size=0.8*sc)
        bpy.context.active_object.location = pos
    elif kind == 'dodecahedron':
        bpy.ops.mesh.primitive_solid_add(source='12', size=0.8*sc)
        bpy.context.active_object.location = pos
    elif kind == 'torusKnot':
        bpy.ops.mesh.primitive_torus_add(major_radius=0.5*sc, minor_radius=0.15*sc, major_segments=64, minor_segments=16, location=pos)
        bpy.ops.object.shade_smooth()
    elif kind in ('box', 'cube'):
        bpy.ops.mesh.primitive_cube_add(size=1.0*sc, location=pos)
        m = bpy.context.active_object.modifiers.new(name='bevel', type='BEVEL')
        m.width = 0.03
        m.segments = 2
        bpy.ops.object.shade_smooth()
    else:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.6*sc, segments=48, ring_count=24, location=pos)
        bpy.ops.object.shade_smooth()

    obj = bpy.context.active_object
    obj.name = name

    mat = make_material(name, col, em, rough, metal)
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    print('BUILT:', name, kind, 'color=', col, 'metal=', metal, 'rough=', rough)
    return obj

def world_and_lights():
    w = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
    bpy.context.scene.world = w
    w.use_nodes = True
    nodes = w.node_tree.nodes
    links = w.node_tree.links
    for n in list(nodes): nodes.remove(n)
    bg = nodes.new('ShaderNodeBackground')
    bg.inputs['Color'].default_value = (0.05, 0.06, 0.10, 1.0)
    bg.inputs['Strength'].default_value = 0.5
    out = nodes.new('ShaderNodeOutputWorld')
    links.new(bg.outputs['Background'], out.inputs['Surface'])

    bpy.ops.object.light_add(type='AREA', location=(4, 6, 4))
    k = bpy.context.active_object
    k.data.energy = 800; k.data.size = 5; k.data.color = (1.0, 0.95, 0.85)

    bpy.ops.object.light_add(type='AREA', location=(-4, 4, 3))
    f = bpy.context.active_object
    f.data.energy = 400; f.data.size = 6; f.data.color = (0.7, 0.85, 1.0)

    bpy.ops.object.light_add(type='AREA', location=(0, 2, -6))
    r = bpy.context.active_object
    r.data.energy = 500; r.data.size = 4; r.data.color = (0.4, 0.7, 1.0)

    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = 'ground'
    gm = bpy.data.materials.new(name='ground_mat')
    gm.use_nodes = True
    nt = gm.node_tree
    nt.nodes.clear()
    out2 = nt.nodes.new('ShaderNodeOutputMaterial')
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (0.02, 0.03, 0.05, 1.0)
    b.inputs['Roughness'].default_value = 0.4
    b.inputs['Metallic'].default_value = 0.3
    nt.links.new(b.outputs['BSDF'], out2.inputs['Surface'])
    ground.data.materials.append(gm)

def auto_camera(objects):
    if not objects:
        bpy.ops.object.camera_add(location=(0, 3, 6), rotation=(math.radians(78), 0, 0))
        c = bpy.context.active_object
        c.data.lens = 50
        bpy.context.scene.camera = c
        return
    mins = Vector((1e9, 1e9, 1e9))
    maxs = Vector((-1e9, -1e9, -1e9))
    for obj in objects:
        for corner in obj.bound_box:
            w = obj.matrix_world @ Vector(corner)
            for i in range(3):
                mins[i] = min(mins[i], w[i])
                maxs[i] = max(maxs[i], w[i])
    center = (mins + maxs) / 2
    size = (maxs - mins).length
    dist = max(3.5, size * 1.9)
    cam_x = center.x + dist * 0.35
    cam_y = center.y + dist * 0.55
    cam_z = center.z + dist * 0.95
    bpy.ops.object.camera_add(location=(cam_x, cam_z, cam_y))
    c = bpy.context.active_object
    c.data.lens = 50
    direction = Vector((cam_x, cam_z, cam_y)) - center
    c.rotation_euler = direction.to_track_quat('Z', 'Y').to_euler()
    bpy.context.scene.camera = c

def render(outdir):
    s = bpy.context.scene
    engines = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]
    s.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in engines else ('BLENDER_EEVEE' if 'BLENDER_EEVEE' in engines else 'CYCLES')
    try:
        if 'EEVEE' in s.render.engine:
            s.eevee.taa_render_samples = 24
    except:
        pass
    s.render.resolution_x = 1280
    s.render.resolution_y = 720
    s.render.image_settings.file_format = 'PNG'
    s.render.filepath = os.path.join(outdir, 'preview')
    s.view_settings.view_transform = 'Filmic'

def export(outdir):
    p = os.path.join(outdir, 'scene.glb')
    bpy.ops.export_scene.gltf(filepath=p, export_format='GLB', export_apply=True)
    return p

def main():
    argv = sys.argv
    if '--' not in argv:
        print('usage: blender --background --python build_scene.py -- <spec.json> <outdir>')
        sys.exit(1)
    a = argv[argv.index('--')+1:]
    spec_path, outdir = a[0], a[1]
    os.makedirs(outdir, exist_ok=True)
    with open(spec_path) as f:
        spec = json.load(f)
    print('SPEC:', json.dumps(spec)[:400])
    clear()
    world_and_lights()
    objs = []
    for o in spec.get('objects', [])[:6]:
        try:
            objs.append(build(o))
        except Exception as e:
            print('BUILD_ERROR:', o.get('id'), str(e))
    auto_camera(objs)
    render(outdir)
    prev = os.path.join(outdir, 'preview.png')
    bpy.ops.render.render(write_still=True)
    glb = export(outdir)
    print(json.dumps({'status':'ok','preview':prev,'glb':glb,'objects':len(objs)}))

if __name__ == '__main__':
    main()
