const calculateFinancialHealth = ({
  monthly_income,
  monthly_expenses,
  monthly_debt_payment,
  emergency_fund = 0,
}) => {
  const income = Number(monthly_income);
  const expenses = Number(monthly_expenses);
  const debtPayment = Number(monthly_debt_payment);
  const emergencyFund = Number(emergency_fund);

  const dti = income > 0 ? (debtPayment / income) * 100 : 100;
  const eir = income > 0 ? (expenses / income) * 100 : 100;
  const emergencyFundMonths = expenses > 0 ? emergencyFund / expenses : 0;

  let dtiScore = 0;
  if (dti < 20) dtiScore = 40;
  else if (dti < 30) dtiScore = 32;
  else if (dti < 40) dtiScore = 20;
  else if (dti < 50) dtiScore = 10;
  else dtiScore = 0;

  let eirScore = 0;
  if (eir < 50) eirScore = 35;
  else if (eir < 60) eirScore = 28;
  else if (eir < 70) eirScore = 21;
  else if (eir < 80) eirScore = 12;
  else if (eir < 90) eirScore = 5;
  else eirScore = 0;

  let efScore = 0;
  if (emergencyFundMonths >= 6) efScore = 25;
  else if (emergencyFundMonths >= 3) efScore = 18;
  else if (emergencyFundMonths >= 1) efScore = 10;
  else efScore = 0;

  const totalScore = dtiScore + eirScore + efScore;

  let status;
  if (totalScore >= 65) status = 'Sehat';
  else if (totalScore >= 35) status = 'Rawan';
  else status = 'Kritis';

  const recommendations = generateRecommendations({
    status,
    dti,
    eir,
    emergencyFundMonths,
  });

  return {
    debt_to_income_ratio: parseFloat(dti.toFixed(2)),
    expense_to_income_ratio: parseFloat(eir.toFixed(2)),
    emergency_fund_months: parseFloat(emergencyFundMonths.toFixed(1)),
    score: totalScore,
    status,
    recommendation: recommendations,
    detail_scores: {
      dti_score: dtiScore,
      eir_score: eirScore,
      emergency_fund_score: efScore,
    },
  };
};

const generateRecommendations = ({ status, dti, eir, emergencyFundMonths }) => {
  const tips = [];

  if (dti >= 50) {
    tips.push(
      'Cicilan utang Anda melebihi 50% pemasukan. Segera konsultasikan dengan ahli keuangan untuk restrukturisasi utang.',
    );
  } else if (dti >= 30) {
    tips.push(
      'Rasio cicilan utang Anda cukup tinggi (30-50%). Hindari menambah utang baru dan fokus melunasi cicilan yang ada.',
    );
  } else {
    tips.push(
      'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.',
    );
  }

  if (eir >= 90) {
    tips.push(
      'Pengeluaran Anda hampir menyamai pemasukan. Segera kurangi pengeluaran tidak esensial.',
    );
  } else if (eir >= 70) {
    tips.push(
      'Pengeluaran Anda cukup besar (70-90% dari pemasukan). Coba terapkan metode budgeting 50/30/20.',
    );
  } else {
    tips.push(
      'Pengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.',
    );
  }

  if (emergencyFundMonths < 1) {
    tips.push(
      'Anda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.',
    );
  } else if (emergencyFundMonths < 3) {
    tips.push(
      `Dana darurat Anda baru cukup untuk ${emergencyFundMonths.toFixed(1)} bulan. Target minimal adalah 3 bulan pengeluaran.`,
    );
  } else if (emergencyFundMonths < 6) {
    tips.push(
      `Dana darurat Anda cukup untuk ${emergencyFundMonths.toFixed(1)} bulan. Pertimbangkan untuk meningkatkan hingga 6 bulan.`,
    );
  } else {
    tips.push(
      `Dana darurat Anda sangat baik (${emergencyFundMonths.toFixed(1)} bulan). Pertimbangkan untuk mulai berinvestasi.`,
    );
  }

  if (status === 'Kritis') {
    tips.push(
      'Kondisi keuangan Anda dalam status KRITIS. Segera berkonsultasi dengan konsultan keuangan profesional kami.',
    );
  } else if (status === 'Rawan') {
    tips.push(
      'Kondisi keuangan Anda dalam status RAWAN. Konsultasi dengan ahli keuangan dapat membantu mencegah kondisi yang memburuk.',
    );
  }

  return tips.join('\n\n');
};

export { calculateFinancialHealth };
