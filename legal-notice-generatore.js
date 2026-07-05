(function () {
  const form = document.getElementById('noticeForm');
  const previewWrap = document.getElementById('noticePreviewWrap');
  const previewEl = document.getElementById('noticePreview');
  const editBtn = document.getElementById('noticeEditBtn');
  const downloadBtn = document.getElementById('noticeDownloadBtn');

  function todayStr() {
    return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function buildText() {
    const clientName = document.getElementById('ntClientName').value.trim();
    const clientAddress = document.getElementById('ntClientAddress').value.trim();
    const recipientName = document.getElementById('ntRecipientName').value.trim();
    const recipientAddress = document.getElementById('ntRecipientAddress').value.trim();
    const subject = document.getElementById('ntSubject').value.trim();
    const facts = document.getElementById('ntFacts').value.trim();
    const legalGround = document.getElementById('ntLegalGround').value.trim();
    const demand = document.getElementById('ntDemand').value.trim();
    const days = document.getElementById('ntDays').value.trim() || '15';
    const place = document.getElementById('ntPlace').value.trim();

    const legalGroundPara = legalGround
      ? `\nयह भी सूचित किया जाता है कि उपरोक्त कार्य/चूक ${legalGround} के अंतर्गत आती है।\n`
      : '';

    return `कानूनी नोटिस (LEGAL NOTICE)

सेवा में,
${recipientName}
${recipientAddress}

विषय: ${subject}

महोदय/महोदया,

अपने मुवक्किल ${clientName}, निवासी ${clientAddress} के निर्देशानुसार, मैं आपको निम्नलिखित कानूनी नोटिस जारी करती हूँ:

1. ${facts}
${legalGroundPara}
2. अतः आपसे मांग की जाती है कि: ${demand}

आपसे अनुरोध है कि इस नोटिस की प्राप्ति के ${days} दिनों के भीतर उपरोक्त मांग को पूरा करें, अन्यथा मेरे मुवक्किल आपके विरुद्ध समुचित कानूनी/दीवानी/फौजदारी कार्यवाही प्रारम्भ करने हेतु बाध्य होंगे, जिसका सम्पूर्ण खर्च व जिम्मेदारी आपकी होगी।

इस नोटिस की एक प्रति आगे की कार्यवाही हेतु कार्यालय में सुरक्षित रखी गई है।

दिनांक: ${todayStr()}
स्थान: ${place}

भवदीया,
अधिवक्ता प्रतिभा यादव
सिविल कोर्ट, महमूदाबाद, जिला सीतापुर
संपर्क: 9454337340`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    previewEl.textContent = buildText();
    previewWrap.hidden = false;
    previewWrap.scrollIntoView({ behavior: 'smooth' });
  });

  editBtn.addEventListener('click', () => {
    previewWrap.hidden = true;
    form.scrollIntoView({ behavior: 'smooth' });
  });

  downloadBtn.addEventListener('click', () => {
    previewEl.classList.add('print-target');
    window.print();
  });

  window.addEventListener('afterprint', () => {
    previewEl.classList.remove('print-target');
  });
})();

