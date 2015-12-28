var Promise     = require("../lib/promise.js");
var PouchDB     = require("pouchdb");

var db          = new PouchDB("mydb", {adapter: 'websql'});
var validate    = require("validate.js");
var _           = require('lodash');
var util        = require('util');
var constraints = require('./constraints.js');
var ddocs       = require('./designDocs.js');

var iCunti = (function(){
    
    
    /*Faccio dei piccoli wrapper per le operazioni comuni di add update, rimozione*/
    
    var addItem = function(item, itemType, validationCostraints){
        
        return Promise.resolve().then(function(){
            
            /*Validations*/
            if ( validationCostraints ){
                var validations = validate(item, validationCostraints);
                if ( validations ){
                    throw validations;
                }  
            }
            
            // aggiungo l'id se non è presente
            if ( ! item._id )
                item["_id"] = new Date().toISOString();
            // aggiungo la tipologia di item
            item["type"] = itemType;

            return db.put(item);
            
        });  
    }
    
    var getItem = function(itemId){
        
        return Promise.resolve().then(function(){
            if ( ! itemId )
                throw new Error("getItem: You must provide a valid itemId.");

            return db.get(itemId);

        });
    }
    
    var getItems = function(itemType){
        
        return Promise.resolve().then(function(){
            if ( ! itemType )
                throw new Error("getItems: You must provide an itemType to query the existing view.");
            
            return db.query( itemType + '/all',{include_docs: true})
            .then(function(result){
                return Promise.resolve().then(function(){
                    var arrRes = []; 
                    // rimuovo il superfluo e ritorno un array di risultati
                    result.rows.map(function(doc){
                        arrRes.push(doc.doc);
                    });
                    return arrRes;     
                });      
            });
        }); 
    }
    
    var updateItem = function(item, validationContraints){
        
        return Promise.resolve().then(function(){
            if ( _.isEmpty(item) )
                throw new Error("updateItem: You must provide an item");

            if ( ! item._id )
                throw new Error("updateItem: The item obj must have an _id");
            
            /*Validations*/
            if ( validationContraints ){
                
                var validations = validate(item, validationContraints);
                
                if ( validations ){
                    throw validations;
                }  
            }

            if ( item._rev ){
                return db.put(item);
            }else{
                return db.get(item._id).then(function(i){
                    item["_rev"] = i._rev;
                    return db.put(item);
                });
            }     
        });
    }
    
    var removeItem = function(itemId){
        
        return Promise.resolve().then(function(){
            if ( ! itemId )
                throw new Error("removeItem: You must provide itemId."); 

            return db.get(itemId).then(function(doc){
                return db.remove(doc);
            });    
        });
    }
    
    var removeAll = function(){
        return db.allDocs({include_docs: true}).then(function(result){
            return Promise.all(result.rows.map(function(row){
                return db.remove(row.doc);
            }));
        });
    }
    
    
    return {
        
        db: db,
        _log : function(x){console.log(util.inspect(x, false, null, true));},
        init: function(){
            
            /*
                La cosa migliore sarebbe fare una bulkDocs e poi eventualmente eseguire l'update con revision
                dei doc in conflitto, ma sfortunatamente su pouchdb ( e sarebbe da segnalare ) la bulkDocs, in caso di errore,
                ritorna nell'array dei risultati ( ritorna solo in then e mai errori in catch ) il fatto che ci sia un errore 
                ma non include il documento o almeno l'_id del doc in errore!!!
                Per ovviare al problema prima faccio una ricerca dei doc di design, per quelli che trovo inserisco la revision
                ed eseguo la bulkDocs.
            */
            
            return db.allDocs({startkey: '_design/'}).then(function(allDesignDocs){
                
                allDesignDocs.rows.map(function(doc){
                    ddocs.map(function(ddoc){
                        if ( ddoc._id == doc.id )
                            ddoc["_rev"] = doc.value.rev;
                    });
                });
                
                return db.bulkDocs(ddocs);
                
            });
        },
        removeAll: function(){
            return removeAll();
        },
        addCustomer: function(customer){
            return addItem(customer, "customer", constraints.customer);
        },
        getCustomers: function(){
            return getItems("customer");
        },
        getCustomer: function(custId){
            return getItem(custId);
        },
        updateCustomer: function(customer){
            return updateItem(customer, constraints.customer);  
        },
        removeCustomer: function(custId){
            return removeItem(custId);
        },
        addProduct: function(product){
            return addItem(product, "product", constraints.product);
        },
        getProducts: function(){
            return getItems("product");
        },
        getProduct: function(productId){
            return getItem(productId);
        },
        updateProduct: function(product){
            return updateItem(product, constraints.product);
        },
        removeProduct: function(productId){
            return removeItem(productId);
        },
        addOrder: function(order){
            return addItem(order, "order");
        },
        getOrders: function(){
            return getItems("order");
        },
        getOrder: function(orderId){
            return getItem(orderId);
        },
        getOpenOrders: function(){
            return db.query('order/by_customer_id_open_only', { include_docs: true })
            .then(function(result){
                var retArr = [];
                result.rows.map(function(row){
                    retArr.push(row.doc)
                });
               return retArr; 
            });
        },
        getOpenOrdersByCustomerId: function(customerId){
            return db.query('order/by_customer_id_open_only', { key: customerId, include_docs: true})
            .then(function(result){
                var retArr = [];
                result.rows.map(function(row){
                    retArr.push(row.doc)
                });
               return retArr; 
            });
        },
        getOrdersByCustomerId: function(customerId){
            return db.query('order/by_customer_id', { key: customerId, include_docs: true})
            .then(function(result){
                var retArr = [];
                result.rows.map(function(row){
                    retArr.push(row.doc)
                });
               return retArr; 
            });
        },
        updateOrder: function(order){
            return updateItem(order);
        },
        removeOrder: function(orderId){
            return removeItem(orderId);
        }
    }
    
})();

module.exports = iCunti;