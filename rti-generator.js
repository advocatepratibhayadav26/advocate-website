(function () {
  const form = document.getElementById('rtiForm');
  const previewWrap = document.getElementById('rtiPreviewWrap');
  const previewEl = document.getElementById('rtiPreview');
  const editBtn = document.getElementById('rtiEditBtn');
  const downloadBtn = document.getElementById('rtiDownloadBtn');

  let generatedText = '';

  function todayStr() {
    return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function buildText() {
    const name = document.getElementById('rtiApplicantName').value.trim();
    const address = document.getElementById('rtiApplicantAddress').value.trim();
    const contact = document.getElementById('rtiApplicantContact').value.trim();
    const deptName = document.getElementById('rtiDeptName').value.trim();
    const deptAddress = document.getElementById('rtiDeptAddress').value.trim();
    const infoRaw = document.getElementById('rtiInfoSought').value.trim();
    const isBPL = document.getElementById('rtiIsBPL').checked;
    const place = document.getElementById('rtiPlace').value.trim();

    const infoLines = infoRaw.split('\n').map(l => l.trim()).filter(Boolean);
    const numberedInfo = infoLines.map((line, i) => {
      const cleaned = line.replace(/^\d+[.)]\s*/, '');
      return `${i + 1}. ${cleaned}`;
    }).join('\n');

    const feeLine = isBPL
      ? 'मैं गरीबी रेखा से नीचे (BPL) श्रेणी में आता/आती हूँ, अतः नियमानुसार आवेदन शुल्क से मुक्त हूँ। BPL प्रमाण पत्र की प्रति संलग्न है।'
      : 'मैं इस आवेदन के साथ नियमानुसार निर्धारित शुल्क रु. 10/- (केवल दस रुपये) संलग्न कर रहा/रही हूँ।';

    return `सेवा में,
जन सूचना अधिकारी,
${deptName}
${deptAddress}

विषय: सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अंतर्गत आवेदन

महोदय/महोदया,

मैं, ${name}, निवासी ${address}, सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अंतर्गत निम्नलिखित जानकारी चाहता/चाहती हूँ:

${numberedInfo || '1. ______________________________'}

${feeLine}

कृपया अधिनियम के अंतर्गत निर्धारित 30 दिनों की अवधि के भीतर उक्त जानकारी उपलब्ध कराने का कष्ट करें।

दिनांक: ${todayStr()}
स्थान: ${place}

भवदीय/भवदीया,
${name}
${address}
${contact ? 'संपर्क: ' + contact : ''}`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    generatedText = buildText();
    previewEl.textContent = generatedText;
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

