// invoiceHtml.js
// Keep in sync with the admin panel's src/lib/invoice-pdf.ts so both apps
// produce the same bill for the same invoice.

const escapeHtml = value =>
  String(value ?? '').replace(
    /[&<>"']/g,
    ch =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[
        ch
      ]),
  );

// "2026-09-30" -> "30/09/2026" without going through Date (no timezone shift)
const formatDate = value => {
  const [y, m, d] = String(value ?? '').slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
};

const formatAmount = n =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

// Business details from the `master` row, shared by the PDF and the
// on-screen bill card.
export const getBusinessDisplay = (settings = {}) => {
  const name = settings.name || 'My Business';
  // Initials, max 4 chars: "Aadhi Engine Care" -> "AEC"
  const mark =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w[0]?.toUpperCase())
      .join('')
      .slice(0, 4) || 'INV';
  const cityLine = [settings.city, settings.pincode].filter(Boolean).join(' - ');
  // "KIRLOSKAR SPARES FOR ..." -> "KIRLOSKAR"
  const brand = (settings.engineName || '').trim().split(/\s+/)[0] ?? '';

  return {
    name,
    mark,
    engineName: settings.engineName || '',
    address: settings.address || '',
    cityLine,
    mobile: settings.mobile || '',
    brand,
    // "KIRLOSKAR" -> "Kirloskar"
    brandTitle: brand
      ? brand[0].toUpperCase() + brand.slice(1).toLowerCase()
      : '',
  };
};

export const buildInvoiceHtml = ({
  invoiceData,
  items,
  sign,
  amountInWords,
  grandTotal,
  settings,
  logo,
  signImage,
}) => {
  const data = invoiceData;
  const isLabour = data.invoiceType === 'LABOUR';
  const business = getBusinessDisplay(settings);
  const name = escapeHtml(business.name);
  const mark = escapeHtml(business.mark);

  console.log('buildInvoiceHtml', { data, items, sign, amountInWords, grandTotal, settings, logo, signImage });

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
      td, th { border: 1px solid #000; }
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
        <span class="watermark-mark">${mark}</span>
      </div>

      <div class="content">
        <div class="header">
          <table class="company-table">
            <tr>
              <td>
                <div class="top-header">
                  <h1 class="company-name">${name}</h1>
                  <div class="company-mark">${mark}</div>
                </div>
                <div class="company-details">
                  <p>
                    ${
                      business.engineName
                        ? `<b>${escapeHtml(business.engineName)}</b> Engines <br/>`
                        : ''
                    }
                    ${
                      business.address
                        ? `${escapeHtml(business.address).replace(/\r?\n/g, '<br/>')} <br/>`
                        : ''
                    }
                    ${business.cityLine ? `${escapeHtml(business.cityLine)} <br/>` : ''}
                    ${business.mobile ? `<b>Cell: ${escapeHtml(business.mobile)}</b>` : ''}
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
              <td class="bill-value">${escapeHtml(data.billNo)}</td>
              <td class="bill-value">${formatDate(data.invoiceDate)}</td>
            </tr>
          </table>

         <div class="logo">
            ${logo ? `<img src="${logo}" alt="Logo" />` : ''}
          </div>
        </div>

        <div style="margin-top:10px;display:flex;gap:10px;width:100%">
          <table style="width:40%;">
            <tr>
              <td style="padding:5px">
                <h2>To</h2>
                <div style="padding-left:30px">
                  <h3>${escapeHtml(data.customer?.name)} <br/> <b>${escapeHtml(
    data.customer?.mobile,
  )}</b></h3>
                </div>
              </td>
            </tr>
          </table>

          <table style="width:70%;border-collapse:collapse;font-size:14px;text-align:center;font-family:'Times New Roman',serif;">
            <tr>
              <td style="border:1px solid #fff;padding:2px;background:#133c98;color:#fff;font-weight:bold;">Billed From</td>
              <td style="border:1px solid #000;padding:2px">${name}</td>
            </tr>
            ${
              data.paymentStatus !== 'PENDING'
                ? `<tr>
                    <td style="border:1px solid #fff;padding:2px;background:#133c98;color:#fff;font-weight:bold;">Payment Terms</td>
                    <td style="border:1px solid #000;padding:2px">${escapeHtml(
                      data.paymentMode ?? 'Cash',
                    )}</td>
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
              const desc = escapeHtml(item.description ?? item.name ?? '');
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
                        escapeHtml(item.qty || '')
                      }</th><th style="padding:10px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">₹ ${
                        item.unitPrice ? formatAmount(item.unitPrice) : ''
                      }</th>`
                }
                <th style="padding:10px;border-left:2px solid #000;border-right:2px solid #000;border-bottom:none;border-top:none;">₹ ${
                  amount ? formatAmount(amount) : ''
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
          <table style="width:60%;  border:1px solid #000">
            <tr>
              <td style="padding:20px">
                <h2>Amount in Words : ₹ ${formatAmount(grandTotal)}</h2>
                <div style="padding:5px">
                  <h3 style="line-height:1.7">${escapeHtml(amountInWords)} /-</h3>
                </div>
              </td>
            </tr>
          </table>

          <table style="width:70%;border-collapse:collapse;font-size:14px;text-align:center;font-family:'Times New Roman',serif;border:1px solid #000;">
            <tr><td style="border:none;padding:8px;font-size:15px"><b>${name}</b></td></tr>
            <tr>
              ${
                sign && signImage
                  ? `<td style="border:none;padding:8px 12px"><img src="${signImage}" style="max-width:60%;max-height:80px;object-fit:contain" /></td>`
                  : `<td style="border:none;padding:8px 12px"></td>`
              }
            </tr>
          </table>
        </div>

        ${
          business.brand
            ? `<div class="footer">
          Only genuine <b>${escapeHtml(business.brand.toUpperCase())}</b> Spares and K-OIL for your ${escapeHtml(
                business.brandTitle,
              )} Engine's Life Long Care.
        </div>`
            : ''
        }
      </div>
    </div>
  </body>
</html>`;
};
