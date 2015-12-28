var constraints = {
    customer: {
        name: {
            presence: true,
            length: {
                minimum: 2,
                maximum: 30
            }
        },
        address: {
            presence: true,
            length: {
                minimum: 2,
                maximum: 100
            }
        },
        phone: {
            presence: false,
            length: {
                minimum: 5,
                maximum: 10
            }
        },
        p_iva: {
            presence: true,
            length: {
                minimum: 8,
                maximum: 30
            }
        },
        invoice_prefix: {
            presence: true,
            length: {
                minimum: 1,
                maximum:6
            }
        },
        invoice_num: {
            presence: true,
            numericality: {
                onlyInteger: true,
                greaterThanOrEqualTo : 0
            }
        }
    },
    product: {
        name: {
            presence: true,
            length: {
                minimum: 2,
                maximum: 30
            }
        },
        description: {
            presence: false,
            length: {
                minimum: 2,
                maximum: 30
            }
        },
        price: {
            presence: true,
            numericality: {
                greaterThanOrEqualTo: 0
            }
        },
        tax_pct: {
            presence: true,
            numericality: {
                onlyInteger: true,
                greaterThanOrEqualTo: 0
            }
        }
    }
  
};

module.exports = constraints;