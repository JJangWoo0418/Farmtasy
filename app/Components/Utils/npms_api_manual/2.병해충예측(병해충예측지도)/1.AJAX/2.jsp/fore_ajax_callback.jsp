<%@page import="java.io.*,java.net.*" contentType="text/xml; charset=UTF-8" %><%
String queryString = request.getQueryString();
String openapi_url = "http://ncpms.rda.go.kr/npmsAPI/service?"+queryString+"&serviceType=AA001";
StringBuffer sbf = new StringBuffer();
try{
    URL url = new URL(openapi_url);
    BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream(),"UTF-8"));
    String inputLine;
    while( (inputLine = in.readLine() ) != null ) sbf.append(inputLine);
} catch( Exception e ) {    
}
%><%= sbf.toString() %>