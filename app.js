let productList = document.getElementById("product-list");
const cartButton = document.getElementById("cart-button");

// カート
let cart = [];


// ==============================
// Firestoreから商品を取得
// ==============================

async function loadProducts() {
    productList.innerHTML = "";

    try {

        const snapshot = await window.getDocs(
            window.collection(window.db, "products")
        );

        snapshot.forEach(doc => {

            const product = doc.data();

            const div = document.createElement("div");

            div.className = "product";

            // 商品一覧を表示
            div.innerHTML = `
                <h3>${product.productName}</h3>

                <p class="price">
                    ¥${product.price}
                </p>

                <p>
                    在庫：${product.stock}個
                </p>

                <div class="quantity-control">

                    <button class="minus-button">
                        −
                    </button>

                    <span class="quantity">
                        1
                    </span>

                    <button class="plus-button">
                        ＋
                    </button>

                </div>

                <button class="cart-button">
                    カートに入れる
                </button>
            `;


            // ==============================
            // 商品ごとの数量
            // ==============================

            let quantity = 1;

            const quantityDisplay =
                div.querySelector(".quantity");

            const minusButton =
                div.querySelector(".minus-button");

            const plusButton =
                div.querySelector(".plus-button");

            const addButton =
                div.querySelector(".cart-button");


            // ==============================
            // −ボタン
            // ==============================

            minusButton.addEventListener("click", () => {

                if (quantity > 1) {

                    quantity -= 1;

                    quantityDisplay.textContent =
                        quantity;

                }

            });


            // ==============================
            // ＋ボタン
            // ==============================

            plusButton.addEventListener("click", () => {

                if (quantity >= product.stock) {

                    alert(
                        `在庫は${product.stock}個までです。`
                    );

                    return;
                }

                quantity += 1;

                quantityDisplay.textContent =
                    quantity;

            });


            // ==============================
            // カートに入れる
            // ==============================

            addButton.addEventListener("click", () => {

                if (product.stock <= 0) {

                    alert("この商品は売り切れです。");

                    return;
                }


                // すでにカートにあるか確認
                const existingItem = cart.find(
                    item => item.id === product.productID
                );


                if (existingItem) {

                    // カートに入っている数量＋今回の数量
                    const newQuantity =
                        existingItem.quantity + quantity;


                    // 在庫を超える場合
                    if (newQuantity > product.stock) {

                        alert(
                            `在庫は${product.stock}個までです。`
                        );

                        return;
                    }


                    existingItem.quantity =
                        newQuantity;

                } else {

                    // 新しく追加
                    cart.push({

                        id: product.productID,

                        name: product.productName,

                        price: product.price,

                        stock: product.stock,

                        quantity: quantity

                    });

                }


                updateCartButton();

                alert(
                    `${product.productName}を${quantity}個カートに入れました`
                );

            });


            productList.appendChild(div);

        });

    } catch (error) {

        console.error(
            "商品取得エラー:",
            error
        );

        productList.innerHTML = `
            <p>商品を取得できませんでした。</p>
        `;
    }
}


// ==============================
// カートボタンの表示を更新
// ==============================

function updateCartButton() {

    const totalQuantity = cart.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );

    cartButton.textContent =
        `🛒 カート（${totalQuantity}）`;
}


// ==============================
// カート画面を表示
// ==============================

function showCart() {

    document.querySelector("main").innerHTML = `

        <h2>ショッピングカート</h2>

        <div id="cart-list"></div>

        <button id="back-button">
            商品一覧に戻る
        </button>
    `;

    const cartList =
        document.getElementById("cart-list");


    // ==============================
    // カートが空の場合
    // ==============================

    if (cart.length === 0) {

        cartList.innerHTML = `
            <p>カートは空です。</p>
        `;

    } else {

        // ==============================
        // カートの商品を表示
        // ==============================

        cart.forEach(item => {

            const div =
                document.createElement("div");

            div.className = "cart-item";


            div.innerHTML = `

                <h3>${item.name}</h3>

                <p>
                    ¥${item.price}
                </p>

                <p>
                    数量：${item.quantity}
                </p>

                <p>
                    小計：
                    ¥${item.price * item.quantity}
                </p>

                <button class="remove-button">
                    削除
                </button>
            `;


            // ==============================
            // 削除
            // ==============================

            const removeButton =
                div.querySelector(".remove-button");


            removeButton.addEventListener(
                "click",
                () => {

                    cart = cart.filter(
                        cartItem =>
                            cartItem.id !== item.id
                    );

                    updateCartButton();

                    showCart();

                }
            );


            cartList.appendChild(div);

        });


        // ==============================
        // 合計金額
        // ==============================

        const totalPrice =
            cart.reduce(
                (total, item) =>
                    total +
                    item.price *
                    item.quantity,
                0
            );


        const totalQuantity =
            cart.reduce(
                (total, item) =>
                    total + item.quantity,
                0
            );


        const total =
            document.createElement("div");


        total.innerHTML = `

            <hr>

            <h3>
                商品数：${totalQuantity}個
            </h3>

            <h3>
                合計金額：¥${totalPrice}
            </h3>

        `;


        cartList.appendChild(total);


    }
    // ==============================
    // お会計ボタン
    // ==============================
    
    const checkoutButton = document.createElement("button");
    checkoutButton.id = "checkout-button";
    checkoutButton.textContent = "お会計へ";
    
    checkoutButton.addEventListener("click", () => {
        showCheckout();
    });
    
    cartList.appendChild(checkoutButton);


    // ==============================
    // 商品一覧に戻る
    // ==============================

    document
        .getElementById("back-button")
        .addEventListener(
            "click",
            () => {

                // mainを商品一覧に戻す
                document.querySelector("main").innerHTML = `

                    <h2>商品一覧</h2>

                    <div id="product-list"></div>
                `;

                // productListを更新
                // 新しく作られた要素を取得
                productList =document.getElementById("product-list");

                // 商品を再表示
                loadProducts();

            }
        );
}


// ==============================
// カートボタン
// ==============================

cartButton.addEventListener(
    "click",
    () => {

        showCart();

    }
);

// ==============================
// お会計画面
// ==============================

function showCheckout() {

    document.querySelector("main").innerHTML = `

        <h2>お会計</h2>

        <div id="checkout-list"></div>

        <hr>

        <h3 id="checkout-total"></h3>

        <button id="confirm-button">
            注文を確定する
        </button>

        <button id="checkout-back-button">
            カートに戻る
        </button>
    `;


    const checkoutList =
        document.getElementById("checkout-list");


    // ==============================
    // 商品表示
    // ==============================

    cart.forEach(item => {

        const div =
            document.createElement("div");

        div.className = "checkout-item";

        div.innerHTML = `

            <h3>${item.name}</h3>

            <p>
                数量：${item.quantity}
            </p>

            <p>
                小計：
                ¥${item.price * item.quantity}
            </p>

        `;

        checkoutList.appendChild(div);

    });


    // ==============================
    // 合計金額
    // ==============================

    const totalPrice =
        cart.reduce(
            (total, item) =>
                total +
                item.price * item.quantity,
            0
        );

    document.getElementById("checkout-total")
        .textContent =
        `合計金額：¥${totalPrice}`;


    // ==============================
    // 注文確定
    // ==============================
    
    async function confirmOrder() {
        if (cart.length === 0) {
            alert("カートが空です。");
            return;
        }
        // 受付番号を発行
        
        const receptionNumber =
        "A-" +
        String(Math.floor(Math.random() * 9999) + 1)
        .padStart(4, "0");
        
        // 合計金額
        const totalPrice = cart.reduce(
            (total, item) =>
                total + item.price * item.quantity,
            0
        );
        // Firestoreに保存する商品データ
        const itemsData = cart.map(item => ({
            productID: item.id,
            productName: item.name,
            price: item.price,
            quantity: item.quantity
        }));
        
        // 注文データ
        const orderData = {
            receptionNumber: receptionNumber,
            items: itemsData,
            totalPrice: totalPrice,
            
            // Web版ではまだ会計していない
            paymentMethod: "未選択",
            isPaid: false,
            createdAt: new Date()
        };
        try {

        // ==============================
        // 在庫を減らして注文を保存
        // ==============================

        await window.runTransaction(
            window.db,
            async (transaction) => {

                // カート内の商品を1つずつ処理
                for (const item of cart) {

                    // productsのドキュメント
                    // IDがproductIDと同じ場合
                    const productRef = window.doc(
                        window.db,
                        "products",
                        item.id
                    );

                    // 最新の商品情報を取得
                    const productSnapshot =
                        await transaction.get(productRef);

                    if (!productSnapshot.exists()) {

                        throw new Error(
                            `${item.name}の商品情報が見つかりません。`
                        );
                    }

                    const productData =
                        productSnapshot.data();

                    // 最新在庫
                    const currentStock =
                        productData.stock;

                    // 在庫チェック
                    if (currentStock < item.quantity) {

                        throw new Error(
                            `${item.name}の在庫が不足しています。`
                        );
                    }

                    // 在庫を減らす
                    transaction.update(
                        productRef,
                        {
                            stock:
                                currentStock - item.quantity
                        }
                    );
                }

                // 注文を保存
                const orderRef = window.doc(
                    window.db,
                    "orders",
                    receptionNumber
                );

                transaction.set(
                    orderRef,
                    orderData
                );
            }
        );

        // ==============================
        // 完了画面を表示
        // ==============================

        showOrderComplete(
            receptionNumber,
            totalPrice
        );

        // カートを空にする
        cart = [];

        updateCartButton();

    } catch (error) {

        console.error(
            "注文保存エラー:",
            error
        );

        alert(
            "注文の確定に失敗しました。\n\n" +
            error.message
        );
    }
}

    // ==============================
    // カートに戻る
    // ==============================

    document
        .getElementById("checkout-back-button")
        .addEventListener("click", () => {

            showCart();

        });
}

// ==============================
// 注文確定
// ==============================

async function confirmOrder() {

    if (cart.length === 0) {
        alert("カートが空です。");
        return;
    }

    // 受付番号を発行
    const receptionNumber =
        "A-" +
        String(Math.floor(Math.random() * 9999) + 1)
            .padStart(4, "0");

    // 合計金額
    const totalPrice = cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    // Firestoreに保存する商品データ
    const itemsData = cart.map(item => ({
        productID: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity
    }));

    // 注文データ
    const orderData = {
        receptionNumber: receptionNumber,
        items: itemsData,
        totalPrice: totalPrice,

        // Web版ではまだ会計していない
        paymentMethod: "未選択",
        isPaid: false,

        createdAt: new Date()
    };

    try {

        // Firestoreに保存
        // Firestoreに保存
        await window.setDoc(
            window.doc(
                window.db,
                "orders",
                receptionNumber
            ),
            orderData
        );

        // 完了画面を表示
        showOrderComplete(
            receptionNumber,
            totalPrice
        );

        // カートを空にする
        cart = [];

        updateCartButton();
    
    } catch (error) {
        console.error("注文保存エラー:", error);
        alert(
            "注文の確定に失敗しました。\n\n" +
            error.message
        );
    }
}
function showOrderComplete(receptionNumber) {

    document.querySelector("main").innerHTML = `

        <div class="order-complete">

            <h2>注文が確定しました！</h2>

            <p>受付番号</p>

            <h1>${receptionNumber}</h1>

            <p>
                受付でこの番号をスタッフに提示してください。
            </p>

            <button id="back-to-products">
                商品一覧に戻る
            </button>

        </div>

    `;

    document
        .getElementById("back-to-products")
        .addEventListener("click", () => {

            location.reload();

        });
}



// ==============================
// 商品を読み込む
// ==============================

loadProducts();