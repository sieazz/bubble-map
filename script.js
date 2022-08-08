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
    const edgeActiveWidth = "3px";
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
        // {
        //   selector: "node[type='object']",
        //   style: {
        //     "background-color": "#a3a3a3",
        //   },
        // },
        // {
        //   selector: "node[type='skill']",
        //   style: {
        //     "background-color": "#6e6e6e",
        //   },
        // },
        // {
        //   selector: "node[type='study']",
        //   style: {
        //     "background-color": "#3d3c3c",
        //   },
        // },

        {
          selector: "edge",
          style: {
            width: edgeWidth,
            "line-color": edgeColor,
            "target-arrow-color": edgeColor,
            "curve-style": "bezier",
            "target-arrow-shape": "triangle-backcurve",
          },
        },
      ],
    });

    // 노드 생성 시 id 자동생성
    let nextID = "0"
    if (cy.nodes()[0]) {
      nextID = cy.nodes()[0].id();
      for (let i = 1; i < cy.nodes().length; i++) {
        if (parseInt(nextID) < parseInt(cy.nodes()[i].id())) {
          nextID = cy.nodes()[i].id();
        }
      }
      nextID = String(parseInt(nextID) + 1);
    }


    // data.json 업데이트
    function updateData(cy) {
      var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
      xmlhttp.open("POST", "/");
      xmlhttp.setRequestHeader("Content-Type", "application/json");
      xmlhttp.send(JSON.stringify(cy.json().elements));
    }

    // 특정 오른쪽마우스 창 열기
    function openPopMenu(popMenuID, x, y) {
      const popMenu = document.getElementById(popMenuID);
      popMenu.style.position = "relative";
      popMenu.style.left = x;
      popMenu.style.top = y;
      popMenu.style.display = "block";
    }

    // 기존에 열여있는 오른쪽마우스 창 전부 닫기
    function closeEveryPopMenu() {
      collection = document.getElementsByClassName("list-group");
      Array.from(collection).map((popMenu) => {
        popMenu.style.display = "none";
        popMenu.style.top = null;
        popMenu.style.left = null;
      });
    }


    // element 삭제
    function delElement(cy, ele) {
      cy.remove(ele);
      run(cy, "cose");
    }


    // node 추가
    function addNode(cy, name) {
      cy.add([
        {
          group: "nodes",
          data: { id: nextID, label: name },
        }
      ]);
      nextID = String(parseInt(nextID) + 1);
      run(cy, "cose");
    }


    // edge 추가
    function addEdge(cy, srcID, destID) {
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
      run(cy, "cose");
    }


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
        // if (e.data().type === "object") {
        //   e.style("background-color", "#a3a3a3");
        // } else if (e.data().type === "skill") {
        //   e.style("background-color", "#6e6e6e");
        // } else if (e.data().type === "study") {
        //   e.style("background-color", "#3d3c3c");
        // }
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

    // 그래프 띄우기
    function run(cy, layoutName) {
      cy.elements()
        .layout({
          name: layoutName,
        })
        .run();
    }




    // 왼쪽/오른쪽 마우스 눌렀을 시 팝업 창 닫기
    cy.on("tapstart cxttapstart", function (event) {
      closeEveryPopMenu();
    })

    // 노드 클릭 시 url 연결
    cy.on("tap", function (event) {
      let url = event.target.data("url");

      if (url && url !== "") {
        if (!url.match(/^https?:\/\//i)) {
          url = 'https://' + url;
        }
        window.open(url);
      }
    });

    // 노드 위로 마우스 올렸을 때 채색
    cy.on("mouseover", "node", function (e) {
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


    // 우측 마우스 클릭
    cy.on("cxttap", function (e) {
      closeEveryPopMenu();
      e.originalEvent.preventDefault();
      var x = e.originalEvent.pageX + "px"; // 현재 마우스의 X좌표
      var y = e.originalEvent.pageY + "px"; // 현재 마우스의 Y좌표

      if (e.target === cy) {
        openPopMenu("popMenuBackground", x, y);

        // 정점 생성
        document.getElementById("addNode").onclick = function () {
          var name = prompt("Enter a node name:", String(nextID));
          if (name) addNode(cy, name);
          closeEveryPopMenu();
        };

        // 그래프 저장
        document.getElementById("updateGraph").onclick = function () {
          updateData(cy);
          closeEveryPopMenu();
        };
      } else {
        if (e.target.isNode()) {
          openPopMenu("popMenuNode", x, y);
          document.querySelector("#popMenuNode div").innerText = `ID: ${e.target.id()}`;

          if (e.target.data("url") && e.target.data("url") !== "") {
            document.querySelector("#urlbox input").value = e.target.data("url");
          } else {
            document.querySelector("#urlbox input").value = ""
          }

          // URL 지정 및 변경
          document.querySelector("#urlbox button").onclick = function () {
            e.target.data("url", document.querySelector("#urlbox input").value);
          }

          // 이름 변경
          document.getElementById("changeNodeName").onclick = function () {
            var name = prompt("Enter a new node name:", e.target.data("label"));
            if (name) e.target.data("label", name);
            closeEveryPopMenu();
          };

          // 정점 삭제
          document.getElementById("delNode").onclick = function () {
            delElement(cy, e.target);
            closeEveryPopMenu();
          };

          // 이 정점을 dest로 하는 간선 생성
          document.getElementById("setDestNode").onclick = function () {
            var srcID = prompt("Enter the src node ID:");
            if (cy.getElementById(srcID).isNode()) addEdge(cy, srcID, e.target.id());
            closeEveryPopMenu();
          };

          // 이 정점을 src로 하는 간선 생성
          document.getElementById("setSrcNode").onclick = function () {
            var destID = prompt("Enter the dest node ID:");
            if (cy.getElementById(destID).isNode()) addEdge(cy, e.target.id(), destID);
            closeEveryPopMenu();
          };

        } else if (e.target.isEdge()) {
          openPopMenu("popMenuEdge", x, y);
          document.querySelector("#popMenuEdge div").innerText = `ID: ${e.target.id()}`;

          // 간선 삭제
          document.getElementById("delEdge").onclick = function () {
            delElement(cy, e.target);
            closeEveryPopMenu();
          };
        }
      }
    });



    // 레이아웃 재배치
    document.addEventListener("keydown", (event) => {
      if (event.key === "r" || event.key === "R") {
        run(cy, "cose");
      }
    });



    // layout run
    run(cy, "cose");

    // 창 크기 변경 시
    let resizeTimer;
    window.addEventListener("resize", function () {
      this.clearTimeout(resizeTimer);
      resizeTimer = this.setTimeout(function () {
        cy.fit();
      }, 200);
    });
  });
