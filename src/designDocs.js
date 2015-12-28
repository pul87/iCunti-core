/*Contiene i documenti di design*/
var ddocs = [
    {
        _id : '_design/customer',
        views: {
            all: {
                map: function(doc){
                    if ( doc.type === "customer" )
                        emit(doc.name);
                }.toString()
            }
        }
    },
    {
        _id : '_design/product',
        views: {
            all: {
                map: function(doc){
                    if ( doc.type === "product" )
                        emit(doc.name);
                }.toString()
            }
        }
    },
    {
        _id : '_design/order',
        views: {
            all: {
                map: function(doc){
                    if ( doc.type === "order" )
                        emit(doc.name);
                }.toString()
            },
            by_customer_id: {
                map: function(doc){
                    if ( doc.type === "order")
                        emit(doc.customer._id);
                }.toString()
            },
            by_customer_id_open_only: {
                map: function(doc){
                    if ( doc.type === "order" && doc.status === "open"){
                        //console.log(doc);
                        emit(doc.customer._id);
                    }
                        
                }.toString()
            }
        }
    }
];

module.exports = ddocs;