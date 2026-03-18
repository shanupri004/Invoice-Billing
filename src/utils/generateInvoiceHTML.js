export const generateInvoiceHTML = ({ invoiceData, amountInWords }) => {
  const rows = invoiceData.products
    .map(
      (item, index) => `
<tr>
<td>${index + 1}</td>
<td>${item.name}</td>
<td>${item.quantity}</td>
<td>₹${item.price}</td>
<td>₹${item.quantity * item.price}</td>
</tr>
`,
    )
    .join('');

  return `
<html>
<head>
<style>

body{
font-family: Arial;
padding:20px;
color:#133C98;
}

.company{
font-size:22px;
font-weight:bold;
padding:10px 5px;
width:60%;
background:#133C98;
color:white;
text-decoration:underline;
}

.divider{
height:2px;
background:#133C98;
margin:10px 0;
}

.dividerDouble{
border-top:2px solid #133C98;
border-bottom:2px solid #133C98;
height:6px;
margin:10px 0;
}

.grid{
display:flex;
justify-content:space-between;
margin:10px 0;
}

.leftCol{
flex:1;
}

.rightCol{
flex:1;
text-align:right;
}

table{
width:100%;
border-collapse:collapse;
margin-top:10px;
}

th{
background:#133C98;
color:white;
padding:8px;
border-right:1px solid white;
}

td{
padding:8px;
border:1px solid #133C98;
text-align:center;
}

.totalRow{
display:flex;
justify-content:flex-end;
margin-top:15px;
font-weight:bold;
}

.words{
margin-top:20px;
}

.signature{
text-align:right;
margin-top:40px;
}

.footer{
text-align:center;
margin-top:20px;
}

</style>
</head>

<body>

<div class="company">Aadhi Engine Services</div>

<div class="divider"></div>

<div class="grid">

<div class="leftCol">
Kirloskar spares for R/HA/R1040<br/>
3 rd street Thammal colony<br/>
Tuticorin - 2<br/>
Email: kingincare@gmail.com<br/>
Cell: 9865254161
</div>

<div class="rightCol">
Bill No : <b>${invoiceData.invoiceNumber}</b><br/>
Date : <b>${invoiceData.date}</b>
</div>

</div>

<div class="dividerDouble"></div>

<div class="grid">
<div>
To : <b>${invoiceData.customerName}</b>
</div>

<div>
Payment Mode : <b>${invoiceData.paymentMode}</b>
</div>
</div>

<table>

<tr>
<th>S.No</th>
<th>Description</th>
<th>Qty</th>
<th>Unit Price</th>
<th>Total</th>
</tr>

${rows}

</table>

<div class="totalRow">
Total : ₹${invoiceData.grandTotal}
</div>

<div class="words">
<b>Total in Words :</b> ${amountInWords}
</div>

<div class="signature">
For Aadhi Engine Services
</div>

<div class="footer">
Only genuine <b>KIRLOSKAR</b> Spares and <b>K-OIL</b> for your Kirloskar Engine's Life long Care
</div>

</body>
</html>
`;
};
