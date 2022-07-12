fetch("./model/data.json", { mode: "no-cors" })
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        // node & font 크기 값
        const nodeSize = 14;
        const nodeActiveSize = 22;
        const fontSize = 6;
        const fontActiveSize = 10;

        // edge & arrow 크기값
        const edgeWidth = "2px";
        var edgeActiveWidth = "3px";
        const arrowScale = 0.7;
        const arrowActiveScale = 0.9;

        // 색
        const dimColor = "#dbdbdb";
        const edgeColor = "#008ce3";
        const nodeColor = "#323233";
        const nodeActiveColor = "#b0214a";
        const successorColor = "#1ed9c9";
        const predecessorsColor = "#dec33c";
        const cycleColor = "#9f73ff";

        const cy = cytoscape({
        container: document.getElementById("cy"), // container to render in

        elements: data,

        style: [
            // the stylesheet for the graph
            {
            selector: "node",
            style: {
                "background-color": nodeColor,
                label: "data(label)",
                width: function (element) {
                return nodeSize;
                },
                height: function (element) {
                return nodeSize;
                },
                "font-size": function (element) {
                return fontSize;
                },
                color: "black", // 라벨의 색
            },
            },

            {
            selector: "edge",
            style: {
                width: 3,
                "line-color": edgeColor,
                "target-arrow-color": edgeColor,
                "curve-style": "bezier",
                "target-arrow-shape": "triangle-backcurve",
            },
            },
        ],
        });

        let nextID = cy.nodes()[0].id();
        for (let i = 1; i < cy.nodes().length; i++) {
        if (parseInt(nextID) < parseInt(cy.nodes()[i].id())) {
            nextID = cy.nodes()[i].id();
        }
        }
        nextID = String(parseInt(nextID) + 1);

        // 모든 node와 edge를 연하게
        function setDimStyle(cy, style) {
        cy.nodes().forEach((e) => {
            e.style(style);
        });
        cy.edges().forEach((e) => {
            e.style(style);
        });
        }

        // 선택한 node와 edge, 상하위 node와 edge를 크기와 색으로 구분
        function setFocus(
        element,
        successorColor,
        predecessorsColor,
        edgeWidth,
        arrowScale
        ) {
        element.successors().forEach((e) => {
            if (e.isEdge()) {
            e.style("width", edgeWidth);
            }
            e.style("color", "black");
            e.style("background-color", successorColor);
            e.style("line-color", successorColor);
            e.style("target-arrow-color", successorColor);
            e.style("arrow-scale", arrowScale);
            setOpacityElement(e, 0.5);
        });

        element.predecessors().forEach((e) => {
            if (e.isEdge()) {
            e.style("width", edgeWidth);
            }

            e.style("color", "black");
            e.style("arrow-scale", arrowScale);

            if (element.successors().includes(e)) {
            e.style("background-color", cycleColor);
            e.style("line-color", cycleColor);
            e.style("target-arrow-color", cycleColor);
            } else {
            e.style("background-color", predecessorsColor);
            e.style("line-color", predecessorsColor);
            e.style("target-arrow-color", predecessorsColor);
            }
            setOpacityElement(e, 0.5);
        });

        element.neighborhood().each(function (e) {
            setOpacityElement(e, 1);
        });

        element.style("background-color", nodeActiveColor);
        element.style("color", nodeColor);
        element.style("opacity", 1);

        element.style("width", nodeActiveSize);
        element.style("height", nodeActiveSize);
        element.style("font-size", fontActiveSize);
        }

        // 불투명도를 사용해 이웃한 연관관계와 그렇지 않은 연관관계 구분
        function setOpacityElement(element, degree) {
        element.style("opacity", degree);
        }

        // node를 선택하기 전의 상태로 되돌림
        function setResetFocus(cy) {
        cy.nodes().forEach((e) => {
            e.style("background-color", nodeColor);
            e.style("width", nodeSize);
            e.style("height", nodeSize);
            e.style("font-size", fontSize);
            e.style("color", "black");
            e.style("opacity", 1);
        });

        cy.edges().forEach((e) => {
            e.style("line-color", edgeColor);
            e.style("target-arrow-color", edgeColor);
            e.style("width", edgeWidth);
            e.style("arrow-scale", arrowScale);
            e.style("opacity", 1);
        });
        }

        // 노드 클릭 시 url 연결
        cy.on("tap", function (event) {
        const url = event.target.data("url");
        if (url && url !== "") {
            window.open(url);
        }
        });

        // 노드 위로 마우스 올렸을 때 채색
        cy.on("tapstart mouseover", "node", function (e) {
        setDimStyle(cy, {
            "background-color": dimColor,
            "line-color": dimColor,
            "target-arrow-color": dimColor,
            color: dimColor,
        });

        setFocus(
            e.target,
            successorColor,
            predecessorsColor,
            edgeActiveWidth,
            arrowActiveScale
        );
        });

        // 노드 밖으로 마우스 나갔을 때 원상태로
        cy.on("tapend mouseout", "node", function (e) {
        setResetFocus(e.cy);
        });

        // 노드삭제
        cy.on("dblclick", "node", function (e) {
        if (cy.nodes().length > 1) {
            cy.remove(e.target);
        }

        cy.elements()
            .layout({
            name: "cose",
            })
            .run();
        });

        // 우측 마우스 클릭
        cy.on("cxttap", "node", function (e) {
        console.dir(e);
        e.originalEvent.preventDefault();
        var x = e.originalEvent.pageX + "px"; // 현재 마우스의 X좌표
        var y = e.originalEvent.pageY + "px"; // 현재 마우스의 Y좌표

        const popMenu = document.getElementById("popMenu"); // 팝업창을 담아옴

        /*
        스타일 지정, 우클릭 한 위치에 팝업창 띄워줌..
        */
        popMenu.style.position = "relative";
        popMenu.style.left = x;
        popMenu.style.top = y;
        popMenu.style.display = "block";
        });



        // layout run
        cy.elements()
        .layout({
            name: "cose",
        })
        .run();

        // 창 크기 변경 시
        let resizeTimer;
        window.addEventListener("resize", function () {
        this.clearTimeout(resizeTimer);
        resizeTimer = this.setTimeout(function () {
            cy.fit();
        }, 200);
        });

        // 레이아웃 재배치
        document.addEventListener("keydown", (event) => {
        if (event.key === "r" || event.key === "R") {
            cy.elements()
            .layout({
                name: "cose",
            })
            .run();
        }
        });



        //클릭시 메뉴 숨기기
        document.addEventListener("click", function (e) {
        // 노출 초기화
        popMenu.style.display = "none";
        popMenu.style.top = null;
        popMenu.style.left = null;
        });
    });