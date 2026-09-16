import bpy, json, sys, os, math

def clear():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for b in bpy.data.meshes: bpy.data.meshes.remove(b)
    for b in bpy.data.materials: bpy.data.materials.remove(b)

def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16)/255.0 for i in (0,2,4))

def build(o):
    kind = o.get('kind','cube')
    pos = o.get('position',[0,0,0])
    sc = o.get('scale',1.0)
    col = hex_rgb(o.get('color','#00f0ff'))
    name = o.get('id','obj')
    if kind == 'sphere': bpy.ops.mesh.primitive_uv_sphere_add(radius=0.6*sc, location=pos)
    elif kind == 'torus': bpy.ops.mesh.primitive_torus_add(major_radius=0.5*sc, minor_radius=0.18*sc, location=pos)
    elif kind == 'cylinder': bpy.ops.mesh.primitive_cylinder_add(radius=0.4*sc, depth=1.2*sc, location=pos)
    elif kind == 'cone': bpy.ops.mesh.primitive_cone_add(radius1=0.5*sc, depth=1.2*sc, location=pos)
    elif kind == 'octahedron':
        bpy.ops.mesh.primitive_solid_add(source='4', size=0.8*sc); bpy.context.active_object.location = pos
    elif kind == 'dodecahedron':
        bpy.ops.mesh.primitive_solid_add(source='12', size=0.8*sc); bpy.context.active_object.location = pos
    elif kind == 'torusKnot':
        bpy.ops.mesh.primitive_torus_add(major_radius=0.5*sc, minor_radius=0.15*sc, location=pos)
    else: bpy.ops.mesh.primitive_cube_add(size=1.0*sc, location=pos)
    obj = bpy.context.active_object; obj.name = name
    mat = bpy.data.materials.new(name=name+'_mat'); mat.use_nodes = True
    b = mat.node_tree.nodes.get('Principled BSDF')
    if b:
        b.inputs['Base Color'].default_value = (*col,1.0)
        b.inputs['Emission Color'].default_value = (*col,1.0)
        b.inputs['Emission Strength'].default_value = o.get('emissive',0.4)
        b.inputs['Roughness'].default_value = o.get('roughness',0.28)
        b.inputs['Metallic'].default_value = o.get('metalness',0.65)
    obj.data.materials.append(mat)

def lights():
    bpy.ops.object.light_add(type='SUN', location=(6,10,6)); bpy.context.active_object.data.energy = 3.0
    bpy.ops.object.light_add(type='AREA', location=(-6,3,-4))
    a = bpy.context.active_object; a.data.energy = 200; a.data.color = (0.2,0.5,1.0)
    w = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
    bpy.context.scene.world = w; w.use_nodes = True
    bg = w.node_tree.nodes.get('Background')
    if bg: bg.inputs['Color'].default_value = (0.03,0.04,0.08,1.0); bg.inputs['Strength'].default_value = 0.5

def camera():
    bpy.ops.object.camera_add(location=(0,2.4,6.5), rotation=(math.radians(80),0,0))
    c = bpy.context.active_object; c.data.lens = 48; bpy.context.scene.camera = c

def render(outdir):
    s = bpy.context.scene
    s.render.engine = 'CYCLES'
    s.cycles.samples = 32
    s.cycles.use_denoising = True
    s.render.resolution_x = 1280
    s.render.resolution_y = 720
    s.render.image_settings.file_format = 'PNG'
    s.render.filepath = os.path.join(outdir,'preview')

def export(outdir):
    p = os.path.join(outdir,'scene.glb')
    bpy.ops.export_scene.gltf(filepath=p, export_format='GLB', export_apply=True)
    return p

def main():
    argv = sys.argv
    if '--' not in argv: print('usage: blender --background --python build_scene.py -- <spec> <outdir>'); sys.exit(1)
    a = argv[argv.index('--')+1:]
    spec_path, outdir = a[0], a[1]
    os.makedirs(outdir, exist_ok=True)
    with open(spec_path) as f: spec = json.load(f)
    clear(); lights(); camera()
    for o in spec.get('objects',[]): build(o)
    render(outdir)
    prev = os.path.join(outdir,'preview.png')
    bpy.ops.render.render(write_still=True)
    glb = export(outdir)
    print(json.dumps({'status':'ok','preview':prev,'glb':glb,'objects':len(spec.get('objects',[]))}))

if __name__ == '__main__': main()
