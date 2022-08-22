// 비밀번호 입력받기
export function authorize(password) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest(); // new HttpRequest instance
        xhr.open("POST", "/");
        xhr.setRequestHeader("Content-Type", "text/plain");
        xhr.responseType = 'text';
        xhr.onload = () => {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                }
            }
        };
        xhr.send(password);
    })
}

// data.json 업데이트
export function updateData(cy) {
    const xhr = new XMLHttpRequest(); // new HttpRequest instance
    xhr.open("POST", "/");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(cy.json().elements));
}