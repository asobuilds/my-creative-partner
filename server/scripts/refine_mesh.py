"""
Synthetix Blender mesh refiner.
Takes a draft GLB from three.ws free tier, applies subdivision + smoothing + material,
and re-exports an improved GLB.

Usage: blender --background --python refine_mesh.py -- <input.glb> <output_dir>
"""
import bpy
import os
import sys
import math
import json
from mathutils import Vector

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in list(bpy.data.meshes): bpy.data.meshes.remove(block)
    for block in list(bpy.data.materials): bpy.data.materials.remove(block)

def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)
    return [o for o in bpy.context.selected_objects if o.type == 'MESH']

def srgb_to_linear(c):
    return tuple(((v+0.055)/1.055)**2.4 if v > 0.04045 else v/12.92 for v in c)

def make_material(name, color, rough, metal, emissive=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    lin = srgb_to_linear(color)
    bsdf.inputs['Base Color'].default_value = (lin[0], lin[1], lin[2], 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    try:
        bsdf.inputs['Emission Color'].default_value = (lin[0], lin[1], lin[2], 1.0)
        bsdf.inputs['Emission Strength'].default_value = emissive
    except KeyError:
        pass
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat

def analyze_and_style(obj, seed_color=None):
    """Guess object characteristics and apply a decent material."""
    # Compute bounding box to guess scale
    bbox = obj.bound_box
    xs = [v[0] for v in bbox]
    ys = [v[1] for v in bbox]
    zs = [v[2] for v in bbox]
    size = Vector((max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs)))
    height_ratio = size.z / max(size.x, size.y, 0.001)

    # Color logic
    if seed_color:
        col = tuple(int(seed_color.lstrip('#')[i:i+2], 16)/255.0 for i in (0, 2, 4))
    else:
        # Neutral warm default — better than grey
        col = (0.85, 0.75, 0.6)

    # Material logic based on shape
    if height_ratio > 1.8:
        # Tall object — likely a figure, building, tree
        rough, metal = 0.55, 0.15
    elif height_ratio < 0.4:
        # Flat object — likely a chest, plate, base
        rough, metal = 0.4, 0.35
    else:
        rough, metal = 0.45, 0.25

    # Clear old materials
    obj.data.materials.clear()
    mat = make_material(obj.name + '_refined', col, rough, metal)
    obj.data.materials.append(mat)

    # Smooth shading
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()

    # Add subdivision surface for smoothing
    subdiv = obj.modifiers.new(name='Subdivision', type='SUBSURF')
    subdiv.levels = 2          # viewport
    subdiv.render_levels = 2   # render
    subdiv.quality = 3

    # Optional: bevel edges for softness
    bevel = obj.modifiers.new(name='Bevel', type='BEVEL')
    bevel.width = 0.004
    bevel.segments = 2
    bevel.limit_method = 'ANGLE'
    bevel.angle_limit = math.radians(50)

    # Apply modifiers
    bpy.ops.object.modifier_apply(modifier='Subdivision')
    bpy.ops.object.modifier_apply(modifier='Bevel')

def reduce_if_heavy(obj, max_polys=80000):
    """Decimate if the subdivided mesh is too heavy for web."""
    current = len(obj.data.polygons)
    if current > max_polys:
        ratio = max_polys / current
        dec = obj.modifiers.new(name='Decimate', type='DECIMATE')
        dec.ratio = ratio
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier='Decimate')
        print('DECIMATED', current, '->', len(obj.data.polygons))

def center_and_scale(objs):
    """Center all objects and scale to a reasonable size."""
    if not objs: return
    mins = Vector((1e9, 1e9, 1e9))
    maxs = Vector((-1e9, -1e9, -1e9))
    for o in objs:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mins[i] = min(mins[i], w[i])
                maxs[i] = max(maxs[i], w[i])
    center = (mins + maxs) / 2
    size = max((maxs - mins).length, 0.1)
    scale = 2.0 / size
    for o in objs:
        o.location = o.location - center
        o.scale = o.scale * scale

def export_glb(output_dir, name='refined'):
    out = os.path.join(output_dir, name + '.glb')
    bpy.ops.export_scene.gltf(
        filepath=out,
        export_format='GLB',
        export_apply=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )
    return out

def main():
    argv = sys.argv
    if '--' not in argv:
        print('usage: blender --background --python refine_mesh.py -- <input.glb> <output_dir> [hex_color]')
        sys.exit(1)
    args = argv[argv.index('--') + 1:]
    input_glb = args[0]
    output_dir = args[1]
    seed_color = args[2] if len(args) > 2 else None

    os.makedirs(output_dir, exist_ok=True)
    clear_scene()

    if not os.path.exists(input_glb):
        print('INPUT_MISSING:', input_glb)
        sys.exit(1)

    objs = import_glb(input_glb)
    print('IMPORTED', len(objs), 'mesh objects')

    for obj in objs:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        analyze_and_style(obj, seed_color)
        reduce_if_heavy(obj)

    center_and_scale(objs)
    out_path = export_glb(output_dir)

    print(json.dumps({
        'status': 'ok',
        'refined_glb': out_path,
        'objects': len(objs),
        'polygons': sum(len(o.data.polygons) for o in objs),
    }))

if __name__ == '__main__':
    main()
