import bpy, math, sys
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[2]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def material(name,color,metal=0,rough=.4):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
black=material('Graphite enamel',(.035,.043,.038),.5,.23)
gold=material('Brushed warm metal',(.64,.47,.20),.85,.23)
face=material('Warm ivory dial',(.86,.84,.75),0,.5)
ink=material('Charcoal markings',(.025,.03,.027),.1,.38)
muted=material('Fine typography',(.22,.25,.22),0,.5)
red=material('Signal lime',(.54,.78,.08),.1,.3)
def finish(obj,name,mat):
 obj.name=name;obj.data.materials.append(mat)
 for p in getattr(obj.data,'polygons',[]):p.use_smooth=True
 return obj
def cylinder(name,radius,depth,y,mat):
 bpy.ops.mesh.primitive_cylinder_add(vertices=128,radius=radius,depth=depth,location=(0,y,0),rotation=(math.pi/2,0,0));o=finish(bpy.context.object,name,mat)
 bevel=o.modifiers.new('Soft machined edge','BEVEL');bevel.width=.018;bevel.segments=3
 o.modifiers.new('Weighted highlights','WEIGHTED_NORMAL');return o
def torus(name,major,minor,y,mat):
 bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=128,minor_segments=20,location=(0,y,0),rotation=(math.pi/2,0,0));return finish(bpy.context.object,name,mat)
def box(name,loc,dimensions,mat,bevel=.01):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=finish(bpy.context.object,name,mat);o.dimensions=dimensions;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  b=o.modifiers.new('Rounded edges','BEVEL');b.width=bevel;b.segments=3;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
cylinder('case',1.4,.28,0,black);torus('rear rim',1.32,.065,.13,black);torus('polished bezel',1.30,.095,-.15,gold);cylinder('dial',1.22,.027,-.174,face)
for i in range(60):
 a=i*math.tau/60;major=i%5==0;r=1.075 if major else 1.10
 o=box(f'tick-{i:02d}',(math.sin(a)*r,-.198,math.cos(a)*r),(.037 if major else .012,.016,.15 if major else .065),ink,.006);o.rotation_euler[1]=a
for n in [12,3,6,9]:
 a=n*math.tau/12;bpy.ops.object.text_add(location=(math.sin(a)*.85,-.213,math.cos(a)*.85),rotation=(math.pi/2,0,0));o=bpy.context.object;o.name=f'numeral-{n}';o.data.body=str(n);o.data.size=.20;o.data.align_x='CENTER';o.data.align_y='CENTER';o.data.extrude=.001;o.data.materials.append(ink)
for label,z,size in [('STUDIO',.34,.085),('QUARTZ',-.43,.055)]:
 bpy.ops.object.text_add(location=(0,-.213,z),rotation=(math.pi/2,0,0));o=bpy.context.object;o.name=label.lower();o.data.body=label;o.data.size=size;o.data.align_x='CENTER';o.data.align_y='CENTER';o.data.space_character=1.3;o.data.materials.append(muted)
def hand(name,length,width,y,angle,mat):
 pivot=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(pivot);pivot.location=(0,y,0)
 o=box(name+'-body',(0,y,length*.42),(width,.027,length),mat,width*.25);o.parent=pivot;o.matrix_parent_inverse=pivot.matrix_world.inverted();pivot.rotation_euler[1]=angle
 return pivot
hand('hour_hand',.67,.085,-.24,math.tau*(10+10/60)/12,ink)
hand('minute_hand',.93,.052,-.28,math.tau*10/60,ink)
hand('second_hand',1.02,.018,-.32,math.tau*43/60,red)
cylinder('pin cap',.09,.045,-.35,gold)
# A narrow reflective ring suggests the protective glass without obscuring the dial.
torus('glass edge',1.205,.012,-.255,material('Glass edge',(.83,.89,.87),.4,.1))
for o in list(bpy.context.scene.objects):
 if o.type=='FONT':bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
out=root/'public/assets/library/studio-clock.glb';out.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_yup=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
# Offline, reproducible lighting preview.
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
world=bpy.data.worlds.new('Studio environment');scene.world=world;world.use_nodes=True;nodes=world.node_tree.nodes;env=nodes.new('ShaderNodeTexEnvironment');env.image=bpy.data.images.load(str(root/'public/assets/library/studio-small-09.hdr'));world.node_tree.links.new(env.outputs['Color'],nodes.get('Background').inputs['Color']);nodes.get('Background').inputs['Strength'].default_value=.7
bpy.ops.object.camera_add(location=(2.4,-7.5,1.65));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=58;scene.camera=cam
scene.render.resolution_x=700;scene.render.resolution_y=700;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.filepath=str(root/'work/studio-clock-preview.png');bpy.ops.render.render(write_still=True)
