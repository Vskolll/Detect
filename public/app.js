// Функция для преобразования XML → JSON
function xmlToJson(xml) {
    let obj = {};

    if (xml.nodeType === 1) { // ELEMENT
        if (xml.attributes.length > 0) {
            obj["$attributes"] = {};
            for (let i = 0; i < xml.attributes.length; i++) {
                const attr = xml.attributes.item(i);
                obj["$attributes"][attr.nodeName] = attr.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) { // TEXT
        return xml.nodeValue.trim();
    }

    if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const nodeName = item.nodeName;

            const value = xmlToJson(item);
            if (value === "") continue;

            if (typeof obj[nodeName] === "undefined") {
                obj[nodeName] = value;
            } else {
                if (!Array.isArray(obj[nodeName])) {
                    obj[nodeName] = [obj[nodeName]];
                }
                obj[nodeName].push(value);
            }
        }
    }

    return obj;
}

// Обновление данных с сервера
async function updateDeviceOutput() {
    const out = document.getElementById("deviceOutput");

    try {
        const res = await fetch("/get-last-device");
        const xmlText = await res.text();

        if (!xmlText || xmlText.startsWith("Пока данных нет")) {
            out.textContent = xmlText;
            return;
        }

        // Парсим XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const json = xmlToJson(xmlDoc);

        // Показываем красиво
        out.textContent = JSON.stringify(json, null, 2);
        
    } catch (err) {
        out.textContent = "Ошибка получения данных.";
    }
}

// Автообновление каждые 2 секунды
setInterval(updateDeviceOutput, 2000);
updateDeviceOutput();
