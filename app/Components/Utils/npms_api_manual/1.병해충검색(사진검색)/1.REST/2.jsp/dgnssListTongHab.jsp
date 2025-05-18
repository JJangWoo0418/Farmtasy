<%@page import="java.io.InputStream"%>
<%@page import="java.net.URLEncoder"%>
<%@page import="org.w3c.dom.NodeList"%>
<%@page import="org.w3c.dom.Node"%>
<%@page import="org.w3c.dom.Element"%>
<%@page import="javax.xml.parsers.DocumentBuilderFactory"%>
<%@page import="org.w3c.dom.Document"%>
<%@page import="java.net.URL"%>

<%@ page contentType="text/html; charset=utf-8" %>
<html>
<head>
<meta http-dquiv="Content-Type" content="text/html" charset="utf-8">

<script type='text/javascript'>

//검색
// 검색조건영역을 만들어서 사용하시면 됩니다.
/* 검색조건설명
 * searchName : 검색명(작물코드, 작물명, 한글명, 영문명(학명)) - 모든 분류에 대한 통합검색
 * divCode : 병해충잡초 구분코드
 * cropCode : 작물코드
 * cropName : 작물명
 * korName : 한글명
 * oprName : 영문명(학명)
 */
function fncSearch(start){
	with(document.apiForm){
		startPoint.value = start;
		method="get";
		action = "";		//통합검색 목록 액션 세팅
		target = "_self";
		submit();
	}
}

//페이지 이동
function fncGoPage(start){
	with(document.apiForm){
		startPoint.value = start;
		method="get";
		action = "";		//통합검색 목록 액션 세팅
		target = "_self";
		submit();
	}
}

//상세화면으로 이동
function fncSvc16Dtl(detailUrl){
	// 상세화면 액션 세팅. (병, 병원체, 해충, 곤충, 천적곤충, 잡초) - 다운받으신 메뉴얼의 병해충검색(사진검색) > 1.REST > 2. jsp 폴더안의 dgnss3_1 ~ dgnss3_5 참고.
}

</script>

</head>
<body>    
<form name="apiForm">
<input type="hidden" name="startPoint"/>

<%
	//통합검색

	String buildTime = null;
	String totalCnt = null;
	String startPoint = null;
	String displayCount = null;
	String errorMsg = null;
	String errorCode = null;
	
	String apiKey = "2012d01f87c6c53767382131302614d4129a";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	String serviceCode = "SVC16";// 통합검색의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	
	//XML 받을 URL 생성
	String parameter = "apiKey="+ apiKey;
	parameter += "&serviceCode="+ serviceCode;
	
	//페이지 이동 처리
	if(request.getParameter("startPoint")!=null&&!request.getParameter("startPoint").equals("")){
		parameter += "&startPoint="+ request.getParameter("startPoint");
	}
	
	//서버와 통신
	URL apiUrl = new URL("http://localhost/npmsAPI/service?"+parameter);
	InputStream apiStream = apiUrl.openStream();
	
	Document doc = null;
	try{
		//xml document
		doc =	DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(apiStream);
		
		//기본정보
		try{buildTime = doc.getElementsByTagName("buildTime").item(0).getFirstChild().getNodeValue();}catch(Exception e){buildTime = "";}//생성시간
		try{totalCnt = doc.getElementsByTagName("totalCount").item(0).getFirstChild().getNodeValue();}catch(Exception e){totalCnt = "";}//전체 갯수
		try{startPoint = doc.getElementsByTagName("startPoint").item(0).getFirstChild().getNodeValue();}catch(Exception e){startPoint = "";}//시작지점
		try{displayCount = doc.getElementsByTagName("displayCount").item(0).getFirstChild().getNodeValue();}catch(Exception e){displayCount = "";}//출력갯수
		try{errorMsg = doc.getElementsByTagName("errorMsg").item(0).getFirstChild().getNodeValue();}catch(Exception e){errorMsg = "";}//에러코드(에러발생시에만 생성)
		try{errorCode = doc.getElementsByTagName("errorCode").item(0).getFirstChild().getNodeValue();}catch(Exception e){errorCode = "";}//에러메시지(에러발생시에만 생성)
	}catch(Exception e){
		e.printStackTrace();
	}finally{
		apiStream.close();
	}
%>

    
   <%if( !errorCode.equals("")){%>
      농촌진흥청 국가농작물 관리시스템 OpenAPI 호출 시 장애가 발생하였습니다.<br/>잠시후에 다시 이용하십시오.
	  <br/>
	  <%=errorMsg%>
	<%}else{
	
		int size = 0;
		
		NodeList items = null;
		NodeList detailUrls = null;
		NodeList divCodes = null;
		NodeList korNames = null;
		NodeList divNames = null;
		NodeList oprNames = null;
		NodeList cropNames = null;
		NodeList cropCodes = null;
		NodeList thumbImgs = null;
		
		items = doc.getElementsByTagName("item");
		size = doc.getElementsByTagName("item").getLength();
		detailUrls = doc.getElementsByTagName("detailUrl");
		divCodes = doc.getElementsByTagName("divCode");
		korNames = doc.getElementsByTagName("korName");
		divNames = doc.getElementsByTagName("divName");
		oprNames = doc.getElementsByTagName("oprName");
		cropNames = doc.getElementsByTagName("cropName");
		cropCodes = doc.getElementsByTagName("cropCode");
		thumbImgs = doc.getElementsByTagName("thumbImg");
		
	%>
				<table  border="0" cellspacing="0" cellpadding="0">
					<colgroup><col width="100"><col width="100"><col width="150"><col width="200"><col width=""></colgroup>
					<thead><tr><th scope="col">구분</th><th scope="col">작물명</th><th scope="col">한글명</th><th scope="col">영문명(학명)</th><th scope="col">대표사진</th></tr></thead>
					<tbody>
				<%if(size == 0){%>
					<tr>
						<td width="100%" valign="top" colspan="5" style="padding-top:12px;">조회한 정보가 없습니다.</td>
                    </tr> 
                <%}else{
                	for(int i=0; i<size; i++){
					
                		String detailUrl = detailUrls.item(i).getFirstChild() == null ? "" : detailUrls.item(i).getFirstChild().getNodeValue();//상세url
                		String divName = divNames.item(i).getFirstChild() == null ? "" : divNames.item(i).getFirstChild().getNodeValue();//구분
                		String cropName = cropNames.item(i).getFirstChild() == null ? "" : cropNames.item(i).getFirstChild().getNodeValue();//작물명
                		String korName = korNames.item(i).getFirstChild() == null ? "" : korNames.item(i).getFirstChild().getNodeValue();//한글명
                		String oprName = oprNames.item(i).getFirstChild() == null ? "" : oprNames.item(i).getFirstChild().getNodeValue();//영문명(학명)
                		String thumbImg = thumbImgs.item(i).getFirstChild() == null ? "" : thumbImgs.item(i).getFirstChild().getNodeValue();//대표사진
				%>
				    <tr>
				    	<td class="ce">
				    		<a onclick="javascript:fncSvc16Dtl('<%=detailUrl%>');return false;" href="#"><%=divName%></a>
				    	</td>
				    	<td class="ce">
				    		<a onclick="javascript:fncSvc16Dtl('<%=detailUrl%>');return false;" href="#"><%=cropName%></a>
				    	</td>
				    	<td class="ce">
				    		<a onclick="javascript:fncSvc16Dtl('<%=detailUrl%>');return false;" href="#"><%=korName%></a>
				    	</td>
				    	<td class="ce">
				    		<a onclick="javascript:fncSvc16Dtl('<%=detailUrl%>');return false;" href="#"><%=oprName%></a>
				    	</td>
				    	<td class="ce">
				    		<img class="bord" src="<%=thumbImg%>" width="120" height="80">
				    	</td>
				    </tr>
				<%
                	}
                }
				%>
					</tbody>
                  </table>
			<br/>
			<%
			//페이징 처리 시작
				int pageGroupSize = 10;
				int pageSize = 0;
				try{
					pageSize = Integer.parseInt(displayCount);
				}catch(Exception e){
					pageSize = 10;
				}
				int start = 0; 
				try{
					start = Integer.parseInt(startPoint);
				}catch(Exception e){
					start = 1;
				}
				
				int currentPage = (int)(Math.ceil((double)start / (double)pageSize));
			
				int startRow = (currentPage - 1) * pageSize + 1;//한 페이지의 시작글 번호 
				int endRow = currentPage * pageSize;//한 페이지의 마지막 글번호           
				int count = Integer.parseInt( totalCnt);                                                            
				int number=0;                                                             
			
				number=count-(currentPage-1)*pageSize;//글목록에 표시할 글번호                                                                  
			    
				//페이지그룹의 갯수                                                                                                             
				//ex) pageGroupSize가 3일 경우 '[1][2][3]'가 pageGroupCount 개 만큼 있다.                                                       
				int pageGroupCount = count/(pageSize*pageGroupSize)+( count % (pageSize*pageGroupSize) == 0 ? 0 : 1);                           
				//페이지 그룹 번호                                                                                                              
				//ex) pageGroupSize가 3일 경우  '[1][2][3]'의 페이지그룹번호는 1 이고  '[2][3][4]'의 페이지그룹번호는 2 이다.                   
				int numPageGroup = (int) Math.ceil((double)currentPage/pageGroupSize);                                                          
			
			
				if(count > 0){
					int pageCount = count / pageSize + ( count % pageSize == 0 ? 0 : 1);
					int startPage = pageGroupSize*(numPageGroup-1)+1;
					int endPage = startPage + pageGroupSize-1;
					int pageNo = 0; int startPnt = 0;
					
					if(endPage > pageCount){
						endPage = pageCount;
					}
					
					if(numPageGroup > 1){
						pageNo = (numPageGroup-2)*pageGroupSize+1;
						startPnt = ((pageNo-1)*pageSize)+1;
						out.println("<a href='javascript:fncGoPage("+startPnt+");'>[이전]</a>");
					}
					
					for(int i=startPage; i<=endPage; i++){
						pageNo = i;
						startPnt = ((pageNo-1)*pageSize)+1;
						out.print("<a href='javascript:fncGoPage("+startPnt+");'>");
						if(currentPage == i){
							out.print("<strong>["+i+"]</strong>");
						}else{
							out.print("["+i+"]");
						}
						out.println("</a>");
					}
					
					if(numPageGroup < pageGroupCount){
						pageNo = (numPageGroup*pageGroupSize+1);
						startPnt = ((pageNo-1)*pageSize)+1;
						out.println("<a href='javascript:fncGoPage("+startPnt+");'>[다음]</a>");
					}
			%>
			<div>
			<%
				}
				//페이징 처리 끝
			%>
	<%}%>
</form>
</body>
</html>