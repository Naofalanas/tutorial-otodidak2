document.addEventListener('alpine:init', () => {
    Alpine.data('products', () => ({
        items: [
            { id: 1, name: 'Robusta Brazil', img: '1.jpg', price: 25000},
            { id: 2, name: 'Arabica Brazil', img: '2.jpg', price: 23000},
            { id: 3, name: 'Liberika Brazil', img: '3.jpg', price: 24000},
        ],
    }));

    Alpine.store('cart', {
        items:[],
        total: 0,
        quantity: 0,
        add(newItem) {
            //cek apakah ada item yang sama di cart
            const cartItem = this.items.find((item) => item.id === newItem.id);

            // jika belom ada
            if(!cartItem){
                this.items.push({...newItem, quantity: 1, total: newItem.price});
                this.quantity++;
                this.total += newItem.price;

            } else {
                //jika barang udah ada, apakah beda atau sama 
                this.items = this.items.map((item) => {
                    //jika barang beda
                    if(item.id !== newItem.id){
                        return item;
                    } else {
                        // jika barng ada tambah quantity dan subtotal
                        item.quantity++;
                        item.total = item.price * item.quantity;
                        this.quantity++;
                        this.total += item.price;
                        return item;

                    }
                })
            }

        },
        remove(id) {
            // ambil item yang mau diremove berdasarkan id
            const cartItem = this.items.find((item) => item.id === id );

            // jika item lebih dari 1
            if(cartItem.quantity > 1) {
                // telusuri satu satu
                this.items = this.items.map ((item) => {
                    // jika bukan barang yang di klik, skip
                    if (item.id !== id ) {
                        return item;
                    } else {
                        item.quantity--;
                        item.total = item.price * item.quantity;
                        this.quantity--;
                        this.total -= item.price;
                        return item;
                    }
                })
            }else if (cartItem.quantity === 1) {
                // jika barang sisa 1
                this.items = this.items.filter ((item) => item.id !== id);
                this.quantity --;
                this.total -= cartItem.price;
            }

        }
    });
});


// konversi ke Rupiah

const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
};