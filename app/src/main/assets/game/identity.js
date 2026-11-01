/* Original interface artwork. Currency amounts and gameplay are independent. */
(function(g){'use strict';
const keys=['coins','gems','tickets','supply','stars','idle','rush','wheel','operations','league','duel','quests','store','army','play','upgrades','albums','settings','garrison','production','capacity','extra_base','produce_boost','move_boost','chest_basic','chest_royal','chest_legend'];
function file(key){return keys.includes(key)?'art/identity/'+key+'.svg':null;}
function image(key,extra=''){return '<img class="identity-icon source-art '+extra+'" src="'+file(key)+'" alt="" draggable="false">';}
const byName={icon_coin:'coins',icon_hard_crystal:'gems',supply:'supply',skipit_icon:'tickets',extra_base_big:'extra_base',produce_speed_big:'produce_boost',move_speed_big:'move_boost'},runtime=g.TerraSourceRuntime,oldFile=runtime.file,oldImage=runtime.image,art=g.TerraCollection.art;
runtime.file=name=>byName[name]?file(byName[name]):oldFile(name);
const coreIds={'53864172bb828476d9c412ea64ababa9:1':'garrison','8474cd43765994a16a12222f0c31e10c:1':'production','16d0141da09bc45ab9afda3cdb4df4d5:1':'capacity'};
runtime.image=(id,extra='')=>coreIds[id]?image(coreIds[id],extra):oldImage(id,extra);
g.TerraCollection.art=(i,hue=0,extra='')=>i===12||i===13?image(i===12?'chest_basic':hue?'chest_legend':'chest_royal','art '+extra):art(i,hue,extra);
g.TerraIdentity={file,image,keys};
})(globalThis);
