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
    ? `${item.name}（${item.remark}）`
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

function buildReceiptHtml(order){

    const rows =
    order.items.map(item=>{

        const row =
        getReceiptColumns(item);

        return `
            <tr>
                <td class="receipt-name">${safeText(row.name)}</td>
                <td class="receipt-num">${safeText(row.qty)}</td>
                <td class="receipt-unit">${safeText(row.unit)}</td>
                <td class="receipt-price">${safeText(row.unitPrice)}</td>
                <td class="receipt-money">$${safeText(row.amount)}</td>
                <td class="receipt-note">${safeText(row.note)}</td>
            </tr>
        `;

    }).join("");

    return `
        <div class="receipt-paper">

            <div class="receipt-title">
                【康源蔬果行】
            </div>

            <div class="receipt-customer">
                ${safeText(order.customer)}
            </div>

            <div class="receipt-date">
                ${formatReceiptDate(order.date)}
            </div>

            <div class="receipt-dash"></div>

            <table class="receipt-table">
                <thead>
                    <tr>
                        <th class="receipt-name">品名</th>
                        <th class="receipt-num">數量</th>
                        <th class="receipt-unit">單位</th>
                        <th class="receipt-price">單價</th>
                        <th class="receipt-money">金額</th>
                        <th class="receipt-note">備註</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>
            </table>

            <div class="receipt-dash"></div>

            <div class="receipt-total">
                合計：$${order.total}
            </div>

        </div>
    `;

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

    const preview =
    document.getElementById("receiptPreview");

    if(preview){
        preview.innerHTML =
        buildReceiptHtml(order);

        document
        .getElementById("receiptModal")
        .classList
        .add("show");
    }else{
        alert(buildReceiptText(order));
    }

}


function buildReceiptSharePage(order){

    const receiptHtml =
    buildReceiptHtml(order);

    const receiptText =
    buildReceiptText(order)
    .replace(/`/g,"\`");

    return `
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>康源蔬果行出貨單</title>
<style>
:root{
    --green:#304d3b;
    --oat:#f4efe6;
    --paper:#fffdf7;
    --line:#222;
}
*{
    box-sizing:border-box;
}
body{
    margin:0;
    padding:18px;
    background:var(--oat);
    font-family:"PingFang TC","Noto Sans TC",sans-serif;
    color:#222;
}
.share-shell{
    max-width:520px;
    margin:0 auto;
}
.share-tip{
    background:#ffffff;
    border-radius:16px;
    padding:14px;
    margin-bottom:14px;
    font-size:14px;
    line-height:1.7;
    color:#444;
}
.share-actions{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
    margin:14px 0;
}
.share-actions button{
    border:none;
    border-radius:14px;
    padding:13px 10px;
    font-size:16px;
    font-weight:800;
}
.primary{
    background:var(--green);
    color:#fff;
}
.secondary{
    background:#fff;
    color:var(--green);
}
.receipt-paper{
    background:var(--paper);
    border:1.5px dashed #888;
    border-radius:18px;
    padding:18px;
    color:#222;
}
.receipt-title{
    font-size:20px;
    font-weight:900;
    margin-bottom:20px;
}
.receipt-customer{
    font-size:18px;
    font-weight:800;
    margin-bottom:6px;
}
.receipt-date{
    font-size:16px;
    letter-spacing:1px;
    margin-bottom:12px;
}
.receipt-dash{
    border-top:2px dashed var(--line);
    margin:12px 0;
}
.receipt-table{
    width:100%;
    border-collapse:collapse;
    table-layout:fixed;
    font-size:13px;
}
.receipt-table th{
    font-weight:900;
    padding:6px 2px 8px;
    border-bottom:1.5px dashed var(--line);
}
.receipt-table td{
    padding:7px 2px;
    border-bottom:1px solid rgba(0,0,0,.13);
    vertical-align:middle;
}
.receipt-table tbody tr:last-child td{
    border-bottom:none;
}
.receipt-name{
    width:30%;
    text-align:left;
    font-weight:800;
    word-break:break-word;
}
.receipt-num{
    width:12%;
    text-align:right;
}
.receipt-unit{
    width:11%;
    text-align:center;
}
.receipt-price{
    width:13%;
    text-align:right;
}
.receipt-money{
    width:16%;
    text-align:right;
    font-weight:800;
}
.receipt-note{
    width:18%;
    text-align:right;
    color:#444;
    word-break:break-word;
}
.receipt-total{
    font-size:18px;
    font-weight:900;
    margin-top:12px;
}
@media(max-width:480px){
    body{
        padding:12px;
    }
    .receipt-paper{
        padding:14px;
    }
    .receipt-table{
        font-size:12px;
    }
}
@media print{
    body{
        background:#fff;
        padding:0;
    }
    .share-tip,
    .share-actions{
        display:none;
    }
    .receipt-paper{
        border:none;
        border-radius:0;
    }
}
</style>
</head>
<body>
<div class="share-shell">

    <div class="share-tip">
        這是出貨單分享頁。手機上可以直接截圖傳給客戶；也可以按「分享文字」或「複製文字」。
    </div>

    <div class="share-actions">
        <button class="primary" onclick="shareText()">分享文字</button>
        <button class="secondary" onclick="copyText()">複製文字</button>
        <button class="secondary" onclick="window.print()">列印/PDF</button>
        <button class="secondary" onclick="window.close()">關閉</button>
    </div>

    ${receiptHtml}

</div>

<script>
const receiptText = \`${receiptText}\`;

async function shareText(){
    if(navigator.share){
        try{
            await navigator.share({
                title:"康源蔬果行出貨單",
                text:receiptText
            });
            return;
        }catch(error){
            if(error && error.name === "AbortError"){
                return;
            }
        }
    }

    await copyText();
}

async function copyText(){
    try{
        await navigator.clipboard.writeText(receiptText);
        alert("已複製出貨單文字");
    }catch(error){
        alert("複製失敗，請手動選取內容");
    }
}
</script>
</body>
</html>
`;

}

function openReceiptSharePage(){

    const order =
    pendingOrder ||
    historyOrders[0];

    const preview =
    document.querySelector(".receipt-paper");

    if(!pendingOrder && !preview){
        alert("目前沒有可分享的出貨單");
        return;
    }

    const targetOrder =
    pendingOrder ||
    {
        customer:"康源蔬果行",
        date:new Date(),
        total:"",
        items:[]
    };

    const html =
    buildReceiptSharePage(targetOrder);

    const page =
    window.open("","_blank");

    if(!page){
        alert("瀏覽器阻擋了新視窗，請允許彈出視窗後再試一次");
        return;
    }

    page.document.open();
    page.document.write(html);
    page.document.close();

}

async function downloadReceiptImage(){

    openReceiptSharePage();

}


