// 특정 오른쪽마우스 창 열기
export function openPopMenu(popMenuID, x, y) {
    const popMenu = document.getElementById(popMenuID);
    popMenu.style.position = "relative";
    popMenu.style.left = x;
    popMenu.style.top = y;
    popMenu.style.display = "block";
}

// 기존에 열여있는 오른쪽마우스 창 전부 닫기
export function closeEveryPopMenu() {
    const collection = document.getElementsByClassName("list-group");
    Array.from(collection).map((popMenu) => {
        popMenu.style.display = "none";
        popMenu.style.top = null;
        popMenu.style.left = null;
    });
}

// element 삭제
export function delElement(cy, ele) {
    cy.remove(ele);
}

// node 추가
export function addNode(cy, name, get_and_renew_id) {
    cy.add([
        {
            group: "nodes",
            data: { id: get_and_renew_id(), label: name },
        }
    ]);
}

// edge 추가
export function addEdge(cy, srcID, destID) {
    cy.add([
        {
            group: "edges",
            data: {
                id: `${srcID}->${destID}`,
                source: srcID,
                target: destID
            },
        }
    ]);
}