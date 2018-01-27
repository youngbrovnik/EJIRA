$(document).ready(function(){
	
}); 

$(window).load ( function() {
	
	var systemMessageArea = document.getElementById("systemMessageArea"); //시스템 메시지
	const MAX_COUNT = 10; //탬플릿 최대 갯수 
	const ENTER_KEY_CODE = 13; 
	
	changeTemplate();
	
	realignmentTemplate();
	
	storeBTStoLocalStorage();	
	
	$("#addBtn").click(function() { 
		addTemplate();	
	});
	
	document.getElementById("nameInputArea").addEventListener("keypress", function(event){
		var pressKeyCode = event.which || event.keyCode;
		if(pressKeyCode == ENTER_KEY_CODE) {
			addTemplate();
		}
	});

	// =============================================================
	// code end
	// =============================================================

	
	// =============================================================
	// function
	// =============================================================
	
	// BTS 입력란에 있는 내용을 로컬 스토리지에 저장하는 함수
	function storeBTStoLocalStorage() {
		
		// BTS summary값을 summaryVal에 storage.
		chrome.tabs.executeScript({
			code : "document.getElementById('summary').value;"
		}, function(results) {
			localStorage.setItem("summaryVal", results)
		});
		
		chrome.tabs.getSelected(null, function(tab) { 
			var url = tab.url;
			url = url.substring(13, 17);
			
			if (url=="tmon") {
				
				// BTS 참조값 referenceVal에 storage
				chrome.tabs.executeScript({
					code : "document.getElementById('customfield_10302').value;"
				}, function(results) {
					localStorage.setItem("referenceVal", results)
				});
				
			} else {
				
				// BTS 참조값 referenceVal에 storage
				chrome.tabs.executeScript({
					code : "document.getElementById('customfield_10020').value;"
				}, function(results) {
					localStorage.setItem("referenceVal", results)
				});
				
			}
			
		})
		
		// BTS 설명을 descriptionVal에 storage
		chrome.tabs.executeScript({
			code : "document.getElementById('description').value;"
		}, function(results) {
			localStorage.setItem("descriptionVal", results)
		});
		
		//이슈생성다이얼로그를 로컬스토리지로 저장
		chrome.tabs.executeScript({
			code : "document.getElementById('create-issue-dialog') | document.getElementById('create-subtask-dialog');"
//			code : ";"
		}, function(results) {
			localStorage.setItem("createIssueDialog", results);
		});
		

	}
	
	// template을 클릭하면 탬플릿에 저장된 내용을 BTS로 불러옴
	function tempNameClickEvtListen(labelNum) {
		
		var label = document.getElementById("myTd" + labelNum);
		var tempName = parseTemplate(labelNum, "inputname");
		
		if (label) {
			label.addEventListener("click", function() {
				
				 systemMessageArea.innerHTML = tempName
				 + " is applied.";
				
				loadData(
						parseTemplate(labelNum, "summaryVal"),
						parseTemplate(labelNum, "referenceVal"), 
						parseTemplate(labelNum, "descriptionVal"));
				storeBTStoLocalStorage();
			});
		}
	}

	// Template delete 버튼 클릭 이벤트 핸들
	function delClickEvtListen(delNum) {

		var del = document.getElementById("delBtn" + delNum);
		
		if (del) {
			del.addEventListener("click", function() {
				// debug code
				// systemMessageArea.innerHTML = (delNum)
				// + "버튼이 눌렸어요";

				// 저장값 지움.
				localStorage.removeItem("template" + delNum);

				// 카운트값 -1, 0이면 제거.
				if (localStorage.tmpCnt > 1) {
					localStorage.tmpCnt = Number(localStorage.tmpCnt) - 1;
				} else {
					localStorage.removeItem("tmpCnt");
				}
				
				uiClear();
				realignmentTemplate();
			});
		}
	}
	
	// Template savehere 버튼 클릭 이벤트 핸들
	function saveHereClickEvtListen(saveHereNum) {

		var saveHere = document.getElementById("saveHereBtn" + saveHereNum);
		
		if (saveHere) {
			saveHere.addEventListener("click", function() {
				var templateJsonSaveHere = "";
				var saveHereName = "";
				saveHereName = parseTemplate(saveHereNum, "inputname");
				systemMessageArea.innerHTML = "saved to " + saveHereName
				 + ".";
				 
				templateJsonSaveHere = '{"template":['+
					'{"inputname":"' + saveHereName + '",' +
					'"summaryVal":"' + localStorage.getItem("summaryVal") + '",' +
					'"referenceVal":"' + localStorage.getItem("referenceVal") + '",' +
					'"descriptionVal":"' + localStorage.getItem("descriptionVal") + '" }]}';
					
				localStorage.setItem("template" + saveHereNum, templateJsonSaveHere); 				
			});
		}
	}
	
	// save 버튼 클릭 이벤트 핸들
	function saveClickEvtListen(saveNum) {

		var save = document.getElementById("saveBtn" + saveNum);
		var editName = document.getElementById("editName" + saveNum).value;
		
		if (save) {
			save.addEventListener("click", function() {
				// debug code
//				systemMessageArea.innerHTML = "Save" + saveNum + " 버튼이 눌렸어요";
				
				localStorage.setItem("inputName", document.getElementById("editName" + saveNum).value);
				localStorage.setItem("summaryVal", parseTemplate(saveNum, "summaryVal"));
				localStorage.setItem("referenceVal", parseTemplate(saveNum, "referenceVal"));
				localStorage.setItem("descriptionVal", parseTemplate(saveNum, "descriptionVal"));
				
				var templateJson = '{"template":['+
				'{"inputname":"' + localStorage.getItem("inputName") + '",' +
				'"summaryVal":"' + localStorage.getItem("summaryVal") + '",' +
				'"referenceVal":"' + localStorage.getItem("referenceVal") + '",' +
				'"descriptionVal":"' + localStorage.getItem("descriptionVal") + '" }]}';
				
				localStorage.setItem("template" + saveNum, templateJson);
				uiClear();
				realignmentTemplate();
			});
		}
	}
	
	// cancel 버튼 클릭 이벤트 핸들
	function cancelClickEvtListen(cancelNum) {

		var cancel = document.getElementById("cancelBtn" + cancelNum);
		
		if (cancel) {
			cancel.addEventListener("click", function() {
				// debug code
//				systemMessageArea.innerHTML = "Cancel" + cancelNum + " 버튼이 눌렸어요";
				printTemplateOnWeb(parseTemplate(cancelNum, "inputname"), cancelNum);
				
			});
		}
	}

	// 스토리지 재정렬, UI print
	function realignmentTemplate() {

		// 탬플릿 로컬 스토리지 재정렬.
		for (var loop = 1; loop <= MAX_COUNT; loop++) {
			
			for (var replaceNum = 1; replaceNum <= MAX_COUNT; replaceNum++) {
				if (localStorage.getItem("template" + (replaceNum + 1))
						&& !(localStorage.getItem("template" + (replaceNum)))) {
					var tempInputName = localStorage.getItem("template"	+ (replaceNum + 1));
					localStorage.setItem("template" + (replaceNum),	tempInputName);
					localStorage.removeItem("template" + (replaceNum + 1));
				}
			}
		}
		
		
		// 존재하는 탬플릿을 ejira web에 print.
		if (localStorage.tmpCnt) {
			for (var i = 1; i <= localStorage.tmpCnt; i++) {
				// web에 템플릿 추가.
				printTemplateOnWeb(parseTemplate(i, "inputname"), i);
			}
		}
	}

	// ADD button action
	function addTemplate() {

		var inputName = document.getElementById("nameInputArea").value;
		var templateJson = "";
				
		// inputName이 있으면.
		if (inputName) {

			// 갯수 제한
			if (localStorage.tmpCnt >= MAX_COUNT) {
				systemMessageArea.innerHTML = "You can create " + MAX_COUNT + " templates.";
			} else {

				// 중복된 이름은 (n)을 붙여서 생성.
				for (var nameNum = 1; inputNameCheck(inputName); nameNum++) {
					if (nameNum > 1) {
						inputName = inputName.substring(0,
								(inputName.length - 3));
					}
					inputName = inputName + "(" + nameNum + ")";
				}

				// 탬플릿 카운트 존재하지않으면 1로 set 존재하면 +1
				if (localStorage.tmpCnt) {
					localStorage.tmpCnt = Number(localStorage.tmpCnt) + 1;
				} else {
					localStorage.tmpCnt = 1;
				}
							
				// inputName localStorage에 저장.
				localStorage.setItem("inputName", inputName);
				
				//이슈생성다이얼로그 로컬스토리지 값을 통해서 창이 존재하는지를 확인
				if(localStorage.getItem("createIssueDialog")) {
					//창이 존재하니 탬플릿
					templateJson = '{"template":['+
					'{"inputname":"' + localStorage.getItem("inputName") + '",' +
					'"summaryVal":"' + localStorage.getItem("summaryVal") + '",' +
					'"referenceVal":"' + localStorage.getItem("referenceVal") + '",' +
					'"descriptionVal":"' + localStorage.getItem("descriptionVal") + '" }]}';
					
					localStorage.setItem("template" + localStorage.tmpCnt, templateJson);
				// 서브테스크 창 확인
				}
				
				// web에 템플릿 추가.
				printTemplateOnWeb(inputName, localStorage.tmpCnt);

				// 입력창 초기화
				document.getElementById("nameInputArea").value = "";
				systemMessageArea.innerHTML = "";
			}
		} else {
		// inputName이 없음.
			systemMessageArea.innerHTML = "Type a name of Template.";
		}
	}
	
	// 입력값을 BTS에 입력
	function loadData(summary, reference, description) {
		
		chrome.tabs.executeScript({
			code : "document.getElementById('summary').value = '" 
					+ summary + "'"
		});

		
		chrome.tabs.getSelected(null, function(tab) { 
			var url = tab.url;
			url = url.substring(13, 17);
			
			if (url=="tmon") {
				
				// '\n'을 '' 으로 치환
				reference = reference.replace(/\n/gi, '');
				chrome.tabs.executeScript({
					code : "document.getElementById('customfield_10302').value = '"	
							+ reference + "'"
				});
				
			} else {
				
				// '\n'을 '' 으로 치환
				reference = reference.replace(/\n/gi, '');
				chrome.tabs.executeScript({
					code : "document.getElementById('customfield_10020').value = '"
							+ reference + "'"
				});
				
			}
			
		})

		// '\n'을 '\\n' 으로 치환
		description = description.replace(/\n/gi, '\\n');
		chrome.tabs.executeScript({
			code : "document.getElementById('description').value = '"
					+ description + "'"
		});

		// debug code.
		// console.log("description : " + description);

	}
	
	// 이름 중복 확인
	function inputNameCheck(name) {
		for (i = 1; i <= localStorage.tmpCnt; i++) {
			
			if (name == parseTemplate(i, "inputname")) {
				return true;
			}
		}
		return false;
	}
	
	// 기존 탬플릿을 json방식으로 변환
	function changeTemplate() {
		var templateJsonChange = "";
		var j;
		var k;
		
		// 
		if (localStorage.getItem("template1")) {
			for (j=2; j<=10; j++) {
				if (!(localStorage.getItem("template" + j))) {
					if (!(localStorage.tepCnt==j-1)) {
						localStorage.tmpCnt=j-1;
						break;
					}
				}
			}
		} else {
			if (localStorage.getItem("inputName1")) {
				localStorage.tmpCnt = 0;
				for (k=1; k<=10; k++) {
					if (localStorage.getItem("inputName" + k)) {
						
						if (localStorage.tmpCnt) {
							localStorage.tmpCnt = Number(localStorage.tmpCnt) + 1;
						} else {
							localStorage.tmpCnt = 1;
						}
						localStorage.setItem("inputName",localStorage.getItem("inputName" + k));
						localStorage.setItem("summaryVal",localStorage.getItem("summaryVal" + k));
						localStorage.setItem("referenceVal",localStorage.getItem("referenceVal" + k));
						localStorage.setItem("descriptionVal",localStorage.getItem("descriptionVal" + k));
						
						templateJsonChange = '{"template":['+
							'{"inputname":"' + localStorage.getItem("inputName") + '",' +
							'"summaryVal":"' + localStorage.getItem("summaryVal") + '",' +
							'"referenceVal":"' + localStorage.getItem("referenceVal") + '",' +
							'"descriptionVal":"' + localStorage.getItem("descriptionVal") + '" }]}';
						
						localStorage.setItem("template" + k, templateJsonChange);
						
						localStorage.removeItem("inputName" + k);
						localStorage.removeItem("summaryVal" + k);
						localStorage.removeItem("referenceVal" + k);
						localStorage.removeItem("descriptionVal" + k);
					} else {
						break;
					}
				}
			}
		}
	}
	
	function parseTemplate(tempnum, inpval) {
		var templateJson = localStorage.getItem("template" + tempnum);
		
		templateJson = templateJson.replace(/\n/gi, '\\n');
		
		var parsed = JSON.parse(templateJson);
		
		if(inpval=="inputname") {
			return parsed.template[0].inputname;
		}
		
		if(inpval=="summaryVal") {
			return parsed.template[0].summaryVal;
		}
		
		if(inpval=="referenceVal") {
			return parsed.template[0].referenceVal;
		}
		
		if(inpval=="descriptionVal") {
			return parsed.template[0].descriptionVal;
		}
		
	}

	// E.JIRA 웹 페이지에 Template을 그려주는 함수
	function printTemplateOnWeb(ipName, numOfCnt) {

		var trElement = document.createElement("TR");  
		var tdElement = document.createElement("TD");
		var td2Element = document.createElement("TD");
		var labelElement = document.createElement("label");
		var saveHereBtnElement = document.createElement("button");
		var delBtnElement = document.createElement("button");
		
		var delSpanElement = document.createElement("SPAN");
		var saveHereSpanElement = document.createElement("SPAN");
		
		var inputNameNode = document.createTextNode(ipName);
		var textNode = document.createTextNode(" ");
		
		var parent = document.getElementById("myTable");
		var target = document.getElementById("myEditTr" + numOfCnt);
		
		trElement.setAttribute("id", "myTr" + numOfCnt);
		
		if(!document.getElementById("myEditTr" + numOfCnt)) {
			//myEditTr이 없음
			document.getElementById("myTable").appendChild(trElement);
			
			tdElement.setAttribute("id", "myTd" + numOfCnt);
			tdElement.setAttribute("Class", "myTd");
			document.getElementById("myTr" + numOfCnt).appendChild(tdElement);
			
			td2Element.setAttribute("id", "buttonsTd" + numOfCnt);
			td2Element.setAttribute("Class", "buttonsTd");
			document.getElementById("myTr" + numOfCnt).appendChild(td2Element);
			
			document.getElementById("myTd" + numOfCnt).appendChild(textNode);
			
			labelElement.setAttribute("id", "tempName" + numOfCnt);
			labelElement.setAttribute("class", "tempName");
			labelElement.style.border = "10";
			document.getElementById("myTd" + numOfCnt).appendChild(labelElement);
			labelElement.appendChild(inputNameNode);

			saveHereBtnElement.setAttribute("name", "saveHereButton");
			saveHereBtnElement.setAttribute("class", "btn btn-success");
			saveHereBtnElement.setAttribute("id", "saveHereBtn" + numOfCnt);
			document.getElementById("buttonsTd" + numOfCnt).appendChild(saveHereBtnElement);
			
			saveHereSpanElement.setAttribute("class", "glyphicon glyphicon-save");
			saveHereSpanElement.setAttribute("aria-hidden", "true");
			document.getElementById("saveHereBtn" + numOfCnt).appendChild(saveHereSpanElement);
			
			delBtnElement.setAttribute("name", "delButton");
			delBtnElement.setAttribute("class", "btn btn-danger");
			delBtnElement.setAttribute("id", "delBtn" + numOfCnt);
//			delBtnElement.appendChild(delNameNode);
			document.getElementById("buttonsTd" + numOfCnt).appendChild(delBtnElement);
			
			delSpanElement.setAttribute("class", "glyphicon glyphicon-trash");
			delSpanElement.setAttribute("aria-hidden", "true");
			document.getElementById("delBtn" + numOfCnt).appendChild(delSpanElement);
			
		} else {
			//myEditTr 존재
			parent.replaceChild(trElement, target);
		}

		//클릭리스너
		tempNameClickEvtListen(numOfCnt);
		delClickEvtListen(numOfCnt);
		saveHereClickEvtListen(numOfCnt);
		
	}
	
	function uiClear() {
		var tablec = document.getElementById("myTable");
		var trlist = document.getElementsByTagName("TR");
		var i;
		var trListLength = trlist.length;
				
		// table을 모두 웹에서 지움.
		for (i=0; i < trListLength; i++) {
			tablec.removeChild(trlist[0]);
//			console.log(i);
		}
	}
} );