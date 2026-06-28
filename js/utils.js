function saveCurrentOrder(){
    localStorage.setItem(
        "orderItems",
        JSON.stringify(orderItems)
    );
}

function formatWeightInput(value){

    if(!value) return "";

    const text = value.trim();

    if(!text.includes("-")){
        return text;
    }

    const parts = text.split("-");
    const jin = Number(parts[0]);
    const liang = Number(parts[1]);

    if(isNaN(jin) || isNaN(liang)){
        return text;
    }

    if(jin === 0 && liang > 0){
        return `${liang}兩`;
    }

    if(liang === 0){
        return `${jin}斤`;
    }

    return `${jin}斤${liang}兩`;

}

function getItemQtyText(item){

    if(item.priceMode === "weight"){

        if(item.qty){
            return `${item.weight || ""}（${item.qty}${item.unit || ""}）`;
        }

        return item.weight || "";

    }

    return `${item.qty || ""}${item.unit || ""}`;

}

function isSameDay(dateValue, target = new Date()){

    const date = new Date(dateValue);

    return (
        date.getFullYear() === target.getFullYear()
        &&
        date.getMonth() === target.getMonth()
        &&
        date.getDate() === target.getDate()
    );

}

function isSameMonth(dateValue, target = new Date()){

    const date = new Date(dateValue);

    return (
        date.getFullYear() === target.getFullYear()
        &&
        date.getMonth() === target.getMonth()
    );

}

function getOrderTotal(items){

    return items.reduce((sum,item)=>{
        return sum + (Number(item.amount) || 0);
    },0);

}

function safeText(value){
    return String(value ?? "");
}
