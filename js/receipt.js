function formatReceiptDate(dateValue){

    if(!dateValue) return "";

    const date =
    new Date(dateValue);

    if(isNaN(date.getTime())){
        return String(dateValue).replaceAll("-","/");
    }

    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;

}

function getReceiptColumns(item){

    let qtyText = "";
    let unitText = "";
    let noteText = "";

    if(item.priceMode === "weight"){

        if(item.qty){
            qtyText = String(item.qty);
            unitText = item.unit || "";
        }else{
            qtyText = "";
            unitText = "";
        }

        noteText = item.weight || "";

    }else{

        qtyText = item.qty || "";
        unitText = item.unit || "";
        noteText = item.weight || "";

    }

    const nameText =
    item.remark
    ? `${item.name}(${item.remark})`
    : item.name;

    return {
        name:nameText,
        qty:qtyText,
        unit:unitText,
        unitPrice:item.unitPrice || "",
        amount:item.amount || "",
        note:noteText
    };

}

function buildReceiptLine(row){

    return (
        padDisplay(row.name,12) +
        padDisplay(row.qty,6,true) +
        " " +
        padDisplay(row.unit,4,true) +
        " " +
        padDisplay(row.unitPrice,6,true) +
        " " +
        padDisplay(`$${row.amount}`,7,true) +
        " " +
        padDisplay(row.note || "",10)
    );

}

function buildReceiptText(order){

    const line =
    "------------------------------------------------";

    let text = "";

    text += "【康源蔬果行】\n\n";
    text += `${order.customer}\n`;
    text += `${formatReceiptDate(order.date)}\n`;
    text += `${line}\n`;

    text += buildReceiptLine({
        name:"品名",
        qty:"數量",
        unit:"單位",
        unitPrice:"單價",
        amount:"金額",
        note:"備註"
    });

    text += "\n";
    text += `${line}\n`;

    order.items.forEach(item=>{

        const row =
        getReceiptColumns(item);

        text +=
        buildReceiptLine(row) + "\n";

    });

    text += `${line}\n`;
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
