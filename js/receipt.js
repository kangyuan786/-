function buildReceiptText(order){

    let text = "";

    text += "蔬果出貨單\n\n";
    text += `${order.customer}\n`;
    text += `${new Date(order.date).toLocaleString("zh-TW")}\n`;
    text += "--------------------\n";

    order.items.forEach(item=>{

        const remark =
        item.remark
        ? `(${item.remark})`
        : "";

        text +=
        `${item.name}${remark} ${getItemQtyText(item)} $${item.amount}\n`;

    });

    text += "--------------------\n";
    text += `合計：$${order.total}`;

    return text;

}

async function copyText(text,message = "已複製"){

    await navigator.clipboard.writeText(text);

    alert(message);

}

async function copyHistoryReceipt(id){

    const order =
    historyOrders.find(item=>String(item.id) === String(id));

    if(!order){
        alert("找不到出貨單");
        return;
    }

    await copyText(
        buildReceiptText(order),
        "出貨單已複製\n可直接貼到 Fun Print"
    );

}

function viewHistoryReceipt(id){

    const order =
    historyOrders.find(item=>String(item.id) === String(id));

    if(!order){
        alert("找不到出貨單");
        return;
    }

    alert(
        buildReceiptText(order)
    );

}
