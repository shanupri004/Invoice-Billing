// invoiceHtml.js
import { Logo, Sign } from '../assets/invoiceImages';
import { COLORS } from '../constants/Colors';

export const buildInvoiceHtml = ({
  invoiceData,
  items,
  sign,
  amountInWords,
  grandTotal,
}) => {
  const data = invoiceData;
  const isLabour = data.invoiceType === 'LABOUR';

  return `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      @font-face {
        font-family: "Monotype Corsiva";
        src: url("file:///android_asset/fonts/Monotype-Corsiva-Regular.ttf") format("truetype"), local("Monotype Corsiva Regular");
        font-weight: normal;
        font-style: normal;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: "Times New Roman", serif; padding: 30px; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; }
      td, th { border: 1px solid #133c98; }
      .page { position: relative; }
      .watermark {
        position: absolute; width: 50%; height: 50%; left: 20%; top: 30%;
        opacity: 0.3; font-family: "Monotype Corsiva", cursive; font-size: 120px;
        font-weight: normal;
        display: flex; justify-content: center; align-items: center; z-index: 0;
      }
      .watermark-mark {
        border: 2px solid #00000055; border-radius: 80%; padding: 25px;
        transform: rotate(-30deg); font-weight: normal;font-family: "Monotype Corsiva"
      }
      .content { position: relative; z-index: 1; }
  .header { display: flex; gap: 4px; align-items: stretch; justify-content: space-between; }
      .top-header {
        background-color: #133c98; display: flex; align-items: center;
        justify-content: space-between; padding: 5px 9px; min-height: 39px;
      }
      .company-table { width: 53%; }
      .company-table td { padding: 0; }
      .company-name { color: #fff; font-family: "Monotype Corsiva", cursive; font-size: 22px; font-weight: normal; }
      .company-mark { border: 1px solid #fff; border-radius: 50%; padding: 4px 7px; color: #fff; font-size: 12px; font-style: italic; transform: rotate(-20deg); font-family: "Monotype Corsiva"}
      .company-details { padding: 4px 6px; line-height: 1.35; }
      .bill-table { width: 32%; text-align: center; }
      .bill-title { height: 39px; background: #85a5f0; font-size: 16px;color:#133c98; font-weight: bold; }
      .bill-label { height: 24px; background: #f1f1f1; font-weight: normal; }
      .bill-value { height: 40px; font-weight: normal; }
      .logo { width: 13%; text-align: center; background: #123A8A; }
      .logo img { max-width: 100%; max-height: 100px; object-fit: contain; }
      .footer { margin-top: 20px; text-align: center; font-size: 13px; }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="watermark">
        <span class="watermark-mark">AEC</span>
      </div>

      <div class="content">
        <div class="header">
          <table class="company-table">
            <tr>
              <td>
                <div class="top-header">
                  <h1 class="company-name">Aadhi Engine Care</h1>
                  <div class="company-mark">AEC</div>
                </div>
                <div class="company-details">
                  <p>
                    <b>KIRLOSKAR SPARES FOR R/HA/R1040/SL90</b> Engines <br/>
                    No. 5, Vetri Nagar <br/>
                    Vickramasingapuram - 627425 <br/>
                    <b>Cell: 9865254161</b>
                  </p>
                </div>
              </td>
            </tr>
          </table>

          <table class="bill-table">
            <tr>
              <th class="bill-title" colspan="2">${isLabour ?"LABOUR BILL":"BILL OF SUPPLY"}</th>
            </tr>
            <tr>
              <th class="bill-label">No.</th>
              <th class="bill-label">Date</th>
            </tr>
            <tr>
              <td class="bill-value">${data.billNo}</td>
              <td class="bill-value">${new Date(data.invoiceDate).toLocaleDateString('en-IN')}</td>
            </tr>
          </table>

         <div class="logo">
            <img src="${Logo}" alt="AEC Logo" />
          </div>
        </div>

        <div style="margin-top:10px;display:flex;gap:10px;width:100%">
          <table style="width:40%;">
            <tr>
              <td style="padding:5px">
                <h2>To</h2>
                <div style="padding-left:30px">
                  <h3>${data.customer.name} <br/> <b>${
    data.customer.mobile
  }</b></h3>
                </div>
              </td>
            </tr>
          </table>

          <table style="width:70%;border-collapse:collapse;font-size:14px;text-align:center;font-family:'Times New Roman',serif;">
            <tr>
              <td style="border:1px solid #fff;padding:2px;background:#133c98;color:#fff;font-weight:bold;">Billed From</td>
              <td style="border:1px solid #000;padding:2px">Aadhi Engine Care</td>
            </tr>
            ${
              data.paymentStatus !== 'PENDING'
                ? `<tr>
                    <td style="border:1px solid #fff;padding:2px;background:#133c98;color:#fff;font-weight:bold;">Payment Terms</td>
                    <td style="border:1px solid #000;padding:2px">Cash</td>
                  </tr>`
                : `<tr>
                    <td style="border:1px solid #fff;padding:2px;background:#133c98;color:#fff;font-weight:bold;">Payment</td>
                    <td style="border:1px solid #000;padding:2px">Not Paid</td>
                  </tr>`
            }
          </table>
        </div>

        <table style="margin-top:20px;border-bottom:2px solid #000">
          <tr style="background-color:#133c98;color:#fff">
            <th style="padding:10px;border:2px solid #fff;">S.No</th>
            <th style="padding:10px;border:2px solid #fff;">Description</th>
            ${
              isLabour
                ? ''
                : '<th style="padding:10px;border:2px solid #fff;">Qty</th><th style="padding:10px;border:2px solid #fff;">Unit Price</th>'
            }
            <th style="padding:10px;border:2px solid #fff;">Amount <br/> Values(Rs.)</th>
          </tr>
          ${items
            .map((item, index) => {
              const desc = item.description ?? item.name ?? '';
              const amount = isLabour
                ? Number(item.amount || 0)
                : Number(item.unitPrice || 0) * Number(item.qty || 0);
              return `<tr>
                <th style="padding:10px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">${
                  index + 1
                }</th>
                <th style="padding:10px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">${desc}</th>
                ${
                  isLabour
                    ? ''
                    : `<th style="padding:10px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">${
                        item.qty || ''
                      }</th><th style="padding:10px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">₹ ${
                        item.unitPrice || ''
                      }</th>`
                }
                <th style="padding:10px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">₹ ${
                  amount || ''
                }</th>
              </tr>`;
            })
            .join('')}
          ${Array.from({ length: Math.max(0, 15 - items.length) })
            .map(
              () => `<tr>
                <th style="padding:10px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">&nbsp;</th>
                <th style="padding:10px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">&nbsp;</th>
                ${
                  isLabour
                    ? ''
                    : '<th style="height:35px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">&nbsp;</th><th style="padding:10px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">&nbsp;</th>'
                }
                <th style="padding:10px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">&nbsp;</th>
              </tr>`,
            )
            .join('')}
        </table>

        <div style="margin-top:10px;display:flex;gap:10px;width:100%">
          <table style="width:60%;">
            <tr>
              <td style="padding:20px">
                <h2>Amount in Words : ₹ ${grandTotal}</h2>
                <div style="padding:5px">
                  <h3 style="line-height:1.7">${amountInWords} /-</h3>
                </div>
              </td>
            </tr>
          </table>

          <table style="width:70%;border-collapse:collapse;font-size:14px;text-align:center;font-family:'Times New Roman',serif;border:1px solid #000;">
            <tr><td style="border:none;padding:8px;font-size:15px"><b>Aadhi Engine Care</b></td></tr>
            <tr>
              ${
                sign
                  ? `<td style="border:none;padding:8px 12px"><img src="${Sign}" width="60%" height="40%" /></td>`
                  : `<td style="border:none;padding:8px 12px"></td>`
              }
            </tr>
          </table>
        </div>

        <div class="footer">
          Only genuine <b>KIRLOSKAR</b> Spares and K-OIL for your Kirloskar Engine's Life Long Care.
        </div>
      </div>
    </div>
  </body>
</html>`;
};
