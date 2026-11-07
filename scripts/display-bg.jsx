// ディスプレイ背景: 15 秒のループ映像
var W=1920,H=1080,D=15,FPS=30;
var c=app.project.items.addComp("display-bg",W,H,1,D,FPS);
var base=c.layers.addSolid([0.043,0.122,0.2],"base",W,H,1,D);
// 流れる光の帯
var cols=[[0.05,0.33,0.45],[0.06,0.45,0.55],[0.09,0.25,0.40],[0.15,0.55,0.62]];
for(var i=0;i<8;i++){
  var w=260+ (i%3)*120;
  var s=c.layers.addSolid(cols[i%4],"band"+i,w,H*2,1,D);
  s.property("Opacity").setValue(14+(i%3)*7);
  s.property("Rotation").setValue(18);
  var x0=-500+i*340, y=H/2;
  s.property("Position").setValueAtTime(0,[x0,y]);
  s.property("Position").setValueAtTime(D,[x0+((i%2)?700:420),y]);
}
function txt(str,size,x,y,color,name){
  var t=c.layers.addText(str);
  t.name=name;
  var sp=t.property("Source Text");
  var d=sp.value; d.font="Noto Sans JP"; d.fontSize=size; d.fillColor=color; d.applyFill=true; d.justification=ParagraphJustification.LEFT_JUSTIFY;
  sp.setValue(d);
  t.property("Position").setValue([x,y]);
  return t;
}
var title=txt("ようこそ ひかり台駅へ",76,96,150,[1,1,1],"title");
title.property("Opacity").setValueAtTime(0,0);
title.property("Opacity").setValueAtTime(0.8,100);
var sub=txt("あさなぎ線  顔認証改札 実証実験",40,100,216,[0.55,0.86,0.93],"sub");
var note=txt("架空の設定によるシミュレーション映像です",28,96,1030,[0.75,0.82,0.88],"note");
writeLn(c.numLayers);
