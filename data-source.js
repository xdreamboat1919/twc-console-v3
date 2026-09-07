/*
 * Manual-first data boundary. Future Meta, Google, Shopify, or warehouse
 * adapters can register here without changing feature calculations or views.
 */
var TWC=window.TWC||{};
TWC.dataSource=(function(){
  var adapters={
    manual:{
      captureFields:function(ids){
        var fields={};
        ids.forEach(function(id){var el=$(id);if(el)fields[id]=el.value});
        return fields;
      },
      applyFields:function(ids,fields){
        ids.forEach(function(id){var el=$(id);if(el&&fields[id]!==undefined)el.value=fields[id]});
      }
    }
  };
  var active='manual';

  return {
    current:function(){return active},
    register:function(name,adapter){
      if(!name||!adapter||typeof adapter.captureFields!=='function'||typeof adapter.applyFields!=='function'){
        throw new Error('A data adapter must implement captureFields and applyFields.');
      }
      adapters[name]=adapter;
    },
    use:function(name){
      if(!adapters[name])throw new Error('Unknown data adapter: '+name);
      active=name;
    },
    captureFields:function(ids){return adapters[active].captureFields(ids)},
    applyFields:function(ids,fields){return adapters[active].applyFields(ids,fields||{})}
  };
})();
window.TWC=TWC;
