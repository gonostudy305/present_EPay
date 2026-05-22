document.addEventListener('DOMContentLoaded', () => {
  /* --- STATE MANAGEMENT --- */
  let currentSlideIndex = 0;
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const slideNumCurrent = document.getElementById('slide-num-current');
  const slideNumTotal = document.getElementById('slide-num-total');
  
  // Slide durations in seconds
  const slideDurations = [20, 60, 60, 60, 60, 60, 30];
  let timerInterval = null;
  let timeRemaining = slideDurations[0];
  let isTimerRunning = false;
  
  const timerCircleVal = document.querySelector('.timer-circle-val');
  const timerText = document.querySelector('.timer-text');
  const timerClock = document.querySelector('.timer-clock');
  const timerSectionName = document.querySelector('.timer-section-name');
  const btnTimerAction = document.getElementById('btn-timer-action');

  /* --- SLIDE NAV LOGIC --- */
  slideNumTotal.textContent = slides.length;
  
  function updateSlides() {
    slides.forEach((slide, idx) => {
      slide.classList.remove('active', 'prev');
      if (idx === currentSlideIndex) {
        slide.classList.add('active');
      } else if (idx < currentSlideIndex) {
        slide.classList.add('prev');
      }
    });
    
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlideIndex);
    });
    
    btnPrev.disabled = currentSlideIndex === 0;
    btnNext.disabled = currentSlideIndex === slides.length - 1;
    slideNumCurrent.textContent = currentSlideIndex + 1;
    
    // Reset and initialize timer for the new slide
    resetTimerForSlide(currentSlideIndex);
    
    // Trigger animations for diagrams depending on slide index
    triggerDiagramAnimations(currentSlideIndex);
  }

  function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
      currentSlideIndex++;
      updateSlides();
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      updateSlides();
    }
  }

  // Bind controls
  btnNext.addEventListener('click', nextSlide);
  btnPrev.addEventListener('click', prevSlide);
  
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      currentSlideIndex = idx;
      updateSlides();
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'Space') {
      if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        nextSlide();
      }
    } else if (e.key === 'ArrowLeft') {
      if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        prevSlide();
      }
    }
  });

  /* --- SMART TIMER LOGIC --- */
  const sectionNames = [
    "Mở đầu - Đặt vấn đề",
    "Việc 1: Tích hợp Đa phương thức",
    "Việc 2: Tối ưu checkout",
    "Việc 3: Khai thác dữ liệu",
    "Việc 4: Hệ sinh thái khép kín",
    "Việc 5: Tận dụng trả sau BNPL",
    "Kết luận - Khóa niềm tin"
  ];

  function resetTimerForSlide(index) {
    clearInterval(timerInterval);
    isTimerRunning = false;
    btnTimerAction.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
      Tập thuyết trình
    `;
    
    timeRemaining = slideDurations[index];
    timerSectionName.textContent = sectionNames[index];
    updateTimerUI();
  }

  function updateTimerUI() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerClock.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Radial Progress Ring update
    const totalDuration = slideDurations[currentSlideIndex];
    const percentage = timeRemaining / totalDuration;
    const strokeDashoffset = 157 * (1 - percentage); // 157 is circumference for r=25
    timerCircleVal.style.strokeDashoffset = strokeDashoffset;
    timerText.textContent = `${timeRemaining}s`;

    // Change color based on urgency
    if (timeRemaining <= 5) {
      timerCircleVal.style.stroke = "var(--accent-rose)";
      timerText.style.color = "var(--accent-rose)";
    } else if (timeRemaining <= 15) {
      timerCircleVal.style.stroke = "var(--accent-purple)";
      timerText.style.color = "var(--accent-purple)";
    } else {
      timerCircleVal.style.stroke = "var(--accent-cyan)";
      timerText.style.color = "var(--accent-cyan)";
    }
  }

  function toggleTimer() {
    if (isTimerRunning) {
      // Pause
      clearInterval(timerInterval);
      isTimerRunning = false;
      btnTimerAction.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        Tiếp tục nói
      `;
    } else {
      // Start
      isTimerRunning = true;
      btnTimerAction.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        Tạm dừng nói
      `;
      
      timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
          timeRemaining--;
          updateTimerUI();
        } else {
          // Timer finished for current slide
          clearInterval(timerInterval);
          isTimerRunning = false;
          timerText.textContent = "Hết!";
          timerCircleVal.style.strokeDashoffset = 157;
          
          // Micro interaction alert (Vibrate if API available)
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          
          // Smart advice
          btnTimerAction.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm-1.7 12.8L12 18v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8z"/>
            </svg>
            Nói lại phần này
          `;
        }
      }, 1000);
    }
  }

  btnTimerAction.addEventListener('click', toggleTimer);

  /* --- INTERACTIVE DIAGRAMS CONTROLLERS --- */
  function triggerDiagramAnimations(index) {
    // Hosted Payment vs Direct API Chart (Slide 3)
    if (index === 2) {
      setTimeout(() => {
        const barHosted = document.querySelector('.chart-bar-hosted');
        const barDirect = document.querySelector('.chart-bar-direct');
        if (barHosted && barDirect) {
          barHosted.style.height = '67%'; // 67% drop off
          barDirect.style.height = '93%'; // 93% conversion (7% drop-off)
        }
      }, 150);
    }
    
    // Simulate flow of Tokenization (Slide 3)
    if (index === 2) {
      animateTokenizationFlow();
    }

    // Ecosystem loop focus highlight (Slide 5)
    if (index === 4) {
      animateEcosystemLoop();
    }
  }

  // Tokenization simulation step-by-step
  function animateTokenizationFlow() {
    const steps = document.querySelectorAll('.flow-step');
    const connectors = document.querySelectorAll('.flow-connector');
    if (steps.length === 0) return;

    let stepIdx = 0;
    steps.forEach(s => s.classList.remove('active'));
    connectors.forEach(c => c.classList.remove('active'));

    function runStep() {
      if (stepIdx < steps.length) {
        steps[stepIdx].classList.add('active');
        if (stepIdx > 0 && connectors[stepIdx - 1]) {
          connectors[stepIdx - 1].classList.add('active');
        }
        stepIdx++;
        setTimeout(runStep, 1500);
      }
    }
    
    setTimeout(runStep, 800);
  }

  // Highlight ecosystem members sequentially
  function animateEcosystemLoop() {
    const ecoItems = document.querySelectorAll('.eco-item');
    if (ecoItems.length === 0) return;

    let activeEcoIdx = 0;
    
    function rotateFocus() {
      // Loop check
      if (currentSlideIndex !== 4) return; // Stop if not on ecosystem slide
      
      ecoItems.forEach(item => item.classList.remove('active'));
      ecoItems[activeEcoIdx].classList.add('active');
      activeEcoIdx = (activeEcoIdx + 1) % ecoItems.length;
      
      setTimeout(rotateFocus, 2000);
    }
    
    setTimeout(rotateFocus, 500);
  }

  /* --- Q&A SIMULATOR INTERACTION --- */
  const qaFilters = document.querySelectorAll('.qa-filter-btn');
  const questionCards = document.querySelectorAll('.question-card');
  const qaPlaceholder = document.querySelector('.qa-placeholder');
  const qaActiveContent = document.querySelector('.qa-active-content');
  
  // QA data container (details answers & key metrics)
  const qaData = {
    "q1": {
      title: "Bạn đề cập tokenization để tối ưu checkout — vậy tokenization là gì và tại sao nó an toàn hơn lưu trực tiếp thông tin thẻ?",
      concept: "concept",
      answer: `Tokenization là kỹ thuật thay thế số thẻ thực (PAN - Primary Account Number) bằng một chuỗi ký tự ngẫu nhiên gọi là \"Token\". Khi khách hàng lưu thẻ trên Shopee, số thẻ thực được gửi trực tiếp đến cổng thanh toán (PCI-DSS Vault) để lưu trữ. Cổng thanh toán trả lại cho Shopee một Token tương ứng. 
      
      Ở các lần mua sau, Shopee chỉ cần dùng Token này để gửi lệnh thanh toán. Điều này an toàn tuyệt đối vì:
      1. Nếu hệ thống Shopee bị hack, tin tặc chỉ lấy được các Token vô nghĩa, không thể dùng để thanh toán ở nơi khác.
      2. Shopee không phải lưu trực tiếp thông tin thẻ, giúp giảm thiểu đáng kể chi phí tuân thủ tiêu chuẩn bảo mật bắt buộc PCI DSS.`,
      keywords: ["PAN (Primary Account Number)", "PCI-DSS Vault", "Token vô nghĩa", "Giảm tải Compliance"],
      advice: "Hãy nhấn mạnh: Token hoàn toàn vô nghĩa nếu bị đánh cắp vì ánh xạ của nó chỉ tồn tại duy nhất trong vault bảo mật của Visa/Mastercard (Visa Token Service) hoặc cổng thanh toán đạt chuẩn PCI DSS Level 1."
    },
    "q2": {
      title: "AI/ML phát hiện gian lận real-time hoạt động dựa trên nguyên lý gì để giảm tỷ lệ Chargeback?",
      concept: "concept",
      answer: `Hệ thống AI/ML (như Risk Engine tích hợp ở Stripe hay VNPay) hoạt động dựa trên nguyên lý Phân tích bất thường (Anomaly Detection) và Hồ sơ hành vi (Behavioral Profiling). Khi có yêu cầu thanh toán, hệ thống sẽ chấm điểm rủi ro (Risk Score từ 0 - 100) trong mili giây dựa trên hàng trăm tín hiệu:
      - Thiết bị (Device fingerprint): Có phải trình duyệt lạ, dùng VPN ẩn danh không?
      - Vận tốc giao dịch (Velocity checks): Một thẻ thanh toán liên tục 5 đơn hàng tại 3 tỉnh thành khác nhau trong 10 phút.
      - Hành vi mua sắm: Giá trị đơn hàng đột ngột tăng gấp 10 lần bình thường.
      
      Nếu Risk Score vượt ngưỡng an toàn, hệ thống sẽ tự động kích hoạt xác thực 3D Secure 2.0 (OTP/sinh trắc học) hoặc từ chối trực tiếp để ngăn chặn rủi ro Chargeback từ thẻ đánh cắp.`,
      keywords: ["Anomaly Detection", "Risk Scoring", "Device Fingerprint", "Velocity Checks", "3D Secure 2.0"],
      advice: "Mách thầy: Việc chặn nhầm khách hàng thật (False Positive) cũng là tổn thất doanh thu lớn, nên AI giúp cân bằng tối ưu giữa bảo mật và trải nghiệm checkout mượt mà."
    },
    "q3": {
      title: "Tích hợp càng nhiều phương thức thanh toán thì chi phí tích hợp và vận hành cũng tăng — liệu có đáng không, đặc biệt với doanh nghiệp nhỏ?",
      concept: "debate",
      answer: `Đây là một bài toán đánh đổi (trade-off) thực tế. Với doanh nghiệp lớn như Tiki, tự phát triển hệ thống kết nối với 10 phương thức là xứng đáng để giữ 70% giỏ hàng. Nhưng với doanh nghiệp nhỏ và vừa, giải pháp tối ưu là sử dụng **Payment Aggregator** (Cổng trung gian tích hợp) hoặc các thư viện mã nguồn mở chuyên dụng (như PayOS do VNPay vận hành, OnePAY, Stripe).
      
      Nhà tích hợp sẽ cung cấp 1 API duy nhất chứa toàn bộ các phương thức (VietQR, ATM, Thẻ tín dụng, Ví MoMo, ZaloPay). Chi phí duy trì cực thấp vì transaction fee (phí trên mỗi giao dịch thành công) thường chỉ tính từ 1% - 2.5% doanh thu, nghĩa là chỉ phát sinh khi doanh nghiệp thực sự có đơn hàng và doanh thu.`,
      keywords: ["Payment Aggregator", "1 API duy nhất", "Transaction Fee theo doanh thu", "Mô hình Pay-as-you-grow"],
      advice: "Trả lời cực hay: Đối với doanh nghiệp nhỏ, việc mất đi 1 khách hàng vì thiếu phương thức thanh toán có chi phí cơ hội lớn hơn rất nhiều so với khoản phí giao dịch 1.5% trả cho cổng thanh toán."
    },
    "q4": {
      title: "Khai thác dữ liệu giao dịch để tăng doanh thu có vi phạm Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân tại VN không?",
      concept: "debate",
      answer: `Câu hỏi cực kỳ thời sự. Nghị định 13/2023/NĐ-CP (có hiệu lực từ 7/2023) quy định rất nghiêm ngặt về việc xử lý dữ liệu cá nhân nhạy cảm, bao gồm thông tin tài chính và lịch sử giao dịch. Doanh nghiệp TMĐT vẫn khai thác dữ liệu hợp pháp nếu thực hiện 3 nguyên tắc cốt lõi:
      1. **Sự đồng ý rõ ràng (Explicit Consent)**: Khi đăng ký tài khoản hoặc checkout, phải có hộp kiểm (checkbox) và điều khoản ghi rõ mục đích sử dụng dữ liệu để cá nhân hóa ưu đãi.
      2. **Tối thiểu hóa dữ liệu (Data Minimization)**: Chỉ thu thập và phân tích dữ liệu cần thiết (khung giờ mua, AOV, phương thức thích hợp), không lưu trữ thông tin nhạy cảm trái phép.
      3. **Mã hóa và Ẩn danh hóa (Pseudonymization)**: Dữ liệu giao dịch khi đưa vào hệ thống AI phân tích phải được ẩn danh hóa danh tính cá nhân.`,
      keywords: ["Nghị định 13/2023/NĐ-CP", "Explicit Consent", "Data Minimization", "Ẩn danh hóa dữ liệu"],
      advice: "Nhấn mạnh: Doanh nghiệp như Grab hay Shopee làm rất tốt khâu consent này ngay trong chính sách bảo mật mà người dùng buộc phải đồng ý khi tạo tài khoản."
    },
    "q5": {
      title: "Giả sử bạn là giám đốc TMĐT của AKIA Smart Home (bán đồ cao cấp) — bạn sẽ ưu tiên tích hợp phương thức thanh toán nào trước và tại sao?",
      concept: "practice",
      answer: `Với đặc thù của **AKIA Smart Home** (bán các thiết bị nhà thông minh có giá trị lớn từ vài triệu đến hàng chục triệu đồng), bản đồ thanh toán cần ưu tiên thiết kế như sau:
      1. **Ưu tiên 1 - Tích hợp BNPL & Trả góp 0% thẻ tín dụng**: Hàng giá trị cao cực kỳ nhạy cảm về giá. Việc chia nhỏ dòng tiền giúp giảm rào cản tài chính tức thì cho khách hàng (ví dụ: chốt đơn bộ khóa vân tay 8 triệu qua Fundiin chỉ với 2.6 triệu trả trước).
      2. **Ưu tiên 2 - VietQR (QR liên ngân hàng NAPAS)**: Khách hàng mua đồ công nghệ cao thường rất thạo chuyển khoản. VietQR giúp quét mã nhanh chóng tại showroom offline lẫn giao diện website online, tiền về tài khoản AKIA tức thì với chi phí rẻ hơn phí thẻ Visa.
      3. **Ưu tiên 3 - Hạn chế COD cho đơn giá trị lớn**: Hàng lắp đặt công nghệ cao có rủi ro bom hàng/hoàn hàng cực kỳ đắt đỏ. AKIA nên áp dụng chính sách giảm 2% hoặc tặng thêm quà nếu khách hàng thanh toán số trước để kích cầu.`,
      keywords: ["BNPL (Fundiin/Kredivo)", "Trả góp 0% Thẻ tín dụng", "VietQR liên thông NAPAS", "Giảm rủi ro hoàn hàng (COD)"],
      advice: "Tự tin liên hệ: Với sản phẩm giá trị lớn, tâm lý khách hàng thường đắn đo. Phương thức BNPL và trả góp 0% là đòn bẩy trực tiếp biến 'Khách hàng đang xem' thành 'Khách hàng đã mua'."
    },
    "q6": {
      title: "Chargeback là gì và tại sao nó nguy hiểm hơn việc hoàn tiền thông thường đối với doanh nghiệp?",
      concept: "practice",
      answer: `Chargeback (Đảo ngược giao dịch) xảy ra khi chủ thẻ yêu cầu **Ngân hàng phát hành** trả lại tiền với lý do bị gian lận hoặc không nhận được hàng, thay vì yêu cầu trực tiếp Merchant (doanh nghiệp). 
      
      Chargeback là cơn ác mộng vì:
      1. **Thiệt hại kép**: Merchant vừa bị trừ tiền đơn hàng, vừa mất luôn hàng hóa đã giao.
      2. **Bị phạt phí dịch vụ nặng**: Các ngân hàng/tổ chức thẻ quốc tế phạt merchant từ $15 - $100 trên mỗi vụ tranh chấp bất kể thắng hay thua.
      3. **Mất khả năng thanh toán thẻ**: Nếu tỷ lệ chargeback của doanh nghiệp vượt quá 1% tổng số giao dịch, Visa/Mastercard có thể đưa doanh nghiệp vào danh sách đen và chấm dứt vĩnh viễn hợp đồng sử dụng cổng thanh toán.`,
      keywords: ["Thiệt hại kép (Double Loss)", "Ngân hàng phát hành quyết định", "Phí phạt Chargeback", "Ngưỡng 1% Visa/Mastercard"],
      advice: "Chốt hạ: Hoàn tiền thông thường (Refund) là sự đồng thuận giữa khách hàng và doanh nghiệp. Chargeback là tranh chấp pháp lý qua ngân hàng có thể hủy hoại uy tín thanh toán của doanh nghiệp."
    }
  };

  // Filter Q&A by category
  qaFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      qaFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      questionCards.forEach(card => {
        if (filter === 'all' || card.dataset.cat === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Handle Q&A Selection
  questionCards.forEach(card => {
    card.addEventListener('click', () => {
      questionCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      const qId = card.dataset.id;
      const data = qaData[qId];
      
      if (data) {
        qaPlaceholder.style.display = 'none';
        qaActiveContent.style.display = 'flex';
        
        // Inject data
        document.getElementById('qa-title').textContent = data.title;
        document.getElementById('qa-answer').innerHTML = data.answer.replace(/\n/g, '<br>');
        document.getElementById('qa-tip').textContent = data.advice;
        
        // Build badges
        const badgesContainer = document.getElementById('qa-badges');
        badgesContainer.innerHTML = '';
        data.keywords.forEach(kw => {
          const badge = document.createElement('span');
          badge.className = 'keyword-badge';
          badge.textContent = kw;
          badgesContainer.appendChild(badge);
        });
      }
    });
  });

  // Default initialize slide
  updateSlides();
});
