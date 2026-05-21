const GROUPS = [
  {
    id: 'numbers',
    label: 'Số đếm',
    icon: '🔢',
    chars: [
      { char: '零', pinyin: 'líng',  meaning: '0️⃣ Không, Số 0', strokes: 13 },
      { char: '一', pinyin: 'yī',   meaning: '1️⃣ Một',         strokes: 1  },
      { char: '二', pinyin: 'èr',   meaning: '2️⃣ Hai',         strokes: 2  },
      { char: '三', pinyin: 'sān',  meaning: '3️⃣ Ba',          strokes: 3  },
      { char: '四', pinyin: 'sì',   meaning: '4️⃣ Bốn',         strokes: 5  },
      { char: '五', pinyin: 'wǔ',   meaning: '5️⃣ Năm',         strokes: 4  },
      { char: '六', pinyin: 'liù',  meaning: '6️⃣ Sáu',         strokes: 4  },
      { char: '七', pinyin: 'qī',   meaning: '7️⃣ Bảy',         strokes: 2  },
      { char: '八', pinyin: 'bā',   meaning: '8️⃣ Tám',         strokes: 2  },
      { char: '九', pinyin: 'jiǔ',  meaning: '9️⃣ Chín',        strokes: 2  },
      { char: '十', pinyin: 'shí',  meaning: '🔟 Mười',         strokes: 2  },
      { char: '百', pinyin: 'bǎi',  meaning: '💯 Trăm',         strokes: 6  },
      { char: '千', pinyin: 'qiān', meaning: '🔢 Nghìn',        strokes: 3  },
    ]
  },
  {
    id: 'people',
    label: 'Con người',
    icon: '👨‍👩‍👧',
    chars: [
      { char: '我', pinyin: 'wǒ',   meaning: '🙋 Tôi, Mình',   strokes: 7  },
      { char: '你', pinyin: 'nǐ',   meaning: '👉 Bạn, Anh/Chị', strokes: 7  },
      { char: '他', pinyin: 'tā',   meaning: '👨 Anh ấy, Ông ấy', strokes: 5 },
      { char: '她', pinyin: 'tā',   meaning: '👩 Cô ấy, Bà ấy', strokes: 6  },
      { char: '人', pinyin: 'rén',  meaning: '👤 Người',        strokes: 2  },
      { char: '爸', pinyin: 'bà',   meaning: '👨 Bố, Ba',       strokes: 8  },
      { char: '妈', pinyin: 'mā',   meaning: '👩 Mẹ, Má',       strokes: 6  },
      { char: '儿', pinyin: 'ér',   meaning: '👦 Con, Con trai', strokes: 2  },
      { char: '女', pinyin: 'nǚ',   meaning: '👧 Nữ, Con gái',  strokes: 3  },
      { char: '师', pinyin: 'shī',  meaning: '👩‍🏫 Thầy, Sư',    strokes: 10 },
      { char: '生', pinyin: 'shēng',meaning: '🎓 Sinh, Học sinh', strokes: 5 },
      { char: '友', pinyin: 'yǒu',  meaning: '🤝 Bạn, Bằng hữu', strokes: 4 },
      { char: '姐', pinyin: 'jiě',  meaning: '👩 Chị gái',      strokes: 8  },
    ]
  },
  {
    id: 'time',
    label: 'Thời gian',
    icon: '🕐',
    chars: [
      { char: '年', pinyin: 'nián', meaning: '📅 Năm',          strokes: 6  },
      { char: '月', pinyin: 'yuè',  meaning: '🌙 Tháng',        strokes: 4  },
      { char: '日', pinyin: 'rì',   meaning: '📆 Ngày',         strokes: 4  },
      { char: '时', pinyin: 'shí',  meaning: '🕐 Giờ',          strokes: 7  },
      { char: '分', pinyin: 'fēn',  meaning: '⏱️ Phút',         strokes: 4  },
      { char: '今', pinyin: 'jīn',  meaning: '📌 Hôm nay',      strokes: 4  },
      { char: '明', pinyin: 'míng', meaning: '🌅 Ngày mai, Sáng', strokes: 8 },
      { char: '昨', pinyin: 'zuó',  meaning: '⬅️ Hôm qua',      strokes: 9  },
      { char: '早', pinyin: 'zǎo',  meaning: '🌄 Buổi sáng',    strokes: 6  },
      { char: '晚', pinyin: 'wǎn',  meaning: '🌆 Buổi tối',     strokes: 11 },
      { char: '上', pinyin: 'shàng',meaning: '⬆️ Trên, Sáng',   strokes: 3  },
      { char: '下', pinyin: 'xià',  meaning: '⬇️ Dưới, Chiều',  strokes: 3  },
      { char: '午', pinyin: 'wǔ',   meaning: '☀️ Trưa, Ngọ',    strokes: 4  },
    ]
  },
  {
    id: 'nature',
    label: 'Thiên nhiên',
    icon: '🌿',
    chars: [
      { char: '天', pinyin: 'tiān', meaning: '🌤️ Trời, Ngày',   strokes: 4  },
      { char: '地', pinyin: 'dì',   meaning: '🌍 Đất, Địa',     strokes: 6  },
      { char: '水', pinyin: 'shuǐ', meaning: '💧 Nước',         strokes: 4  },
      { char: '火', pinyin: 'huǒ',  meaning: '🔥 Lửa',          strokes: 4  },
      { char: '山', pinyin: 'shān', meaning: '⛰️ Núi',          strokes: 3  },
      { char: '木', pinyin: 'mù',   meaning: '🌳 Cây, Gỗ',      strokes: 4  },
      { char: '风', pinyin: 'fēng', meaning: '💨 Gió',          strokes: 4  },
      { char: '云', pinyin: 'yún',  meaning: '☁️ Mây',          strokes: 4  },
      { char: '雨', pinyin: 'yǔ',   meaning: '🌧️ Mưa',          strokes: 8  },
      { char: '雪', pinyin: 'xuě',  meaning: '❄️ Tuyết',        strokes: 11 },
      { char: '冷', pinyin: 'lěng', meaning: '🥶 Lạnh',         strokes: 7  },
      { char: '热', pinyin: 'rè',   meaning: '🥵 Nóng',         strokes: 10 },
    ]
  },
  {
    id: 'life',
    label: 'Cuộc sống',
    icon: '🏠',
    chars: [
      { char: '家', pinyin: 'jiā',  meaning: '🏠 Nhà, Gia đình', strokes: 10 },
      { char: '书', pinyin: 'shū',  meaning: '📚 Sách',          strokes: 4  },
      { char: '字', pinyin: 'zì',   meaning: '✍️ Chữ',           strokes: 6  },
      { char: '钱', pinyin: 'qián', meaning: '💰 Tiền',          strokes: 10 },
      { char: '车', pinyin: 'chē',  meaning: '🚗 Xe',            strokes: 4  },
      { char: '门', pinyin: 'mén',  meaning: '🚪 Cửa',           strokes: 3  },
      { char: '饭', pinyin: 'fàn',  meaning: '🍚 Cơm, Bữa ăn',  strokes: 7  },
      { char: '茶', pinyin: 'chá',  meaning: '🍵 Trà',           strokes: 9  },
      { char: '果', pinyin: 'guǒ',  meaning: '🍎 Quả, Kết quả',  strokes: 8  },
      { char: '猫', pinyin: 'māo',  meaning: '🐱 Mèo',           strokes: 11 },
      { char: '狗', pinyin: 'gǒu',  meaning: '🐶 Chó',           strokes: 8  },
      { char: '电', pinyin: 'diàn', meaning: '⚡ Điện',          strokes: 5  },
    ]
  },
  {
    id: 'verbs',
    label: 'Động từ',
    icon: '🗣️',
    chars: [
      { char: '是', pinyin: 'shì',  meaning: '✅ Là, Đúng',      strokes: 9  },
      { char: '有', pinyin: 'yǒu',  meaning: '🫴 Có',            strokes: 6  },
      { char: '来', pinyin: 'lái',  meaning: '➡️ Đến, Lại',      strokes: 7  },
      { char: '去', pinyin: 'qù',   meaning: '🚶 Đi',            strokes: 5  },
      { char: '吃', pinyin: 'chī',  meaning: '🍽️ Ăn',            strokes: 6  },
      { char: '喝', pinyin: 'hē',   meaning: '🥤 Uống',          strokes: 12 },
      { char: '看', pinyin: 'kàn',  meaning: '👀 Xem, Nhìn',     strokes: 9  },
      { char: '听', pinyin: 'tīng', meaning: '👂 Nghe',          strokes: 7  },
      { char: '说', pinyin: 'shuō', meaning: '💬 Nói',           strokes: 9  },
      { char: '写', pinyin: 'xiě',  meaning: '✏️ Viết',          strokes: 5  },
      { char: '学', pinyin: 'xué',  meaning: '📖 Học',           strokes: 8  },
      { char: '做', pinyin: 'zuò',  meaning: '🛠️ Làm',           strokes: 11 },
    ]
  },
  {
    id: 'adjectives',
    label: 'Tính từ & Đại từ',
    icon: '💬',
    chars: [
      { char: '好', pinyin: 'hǎo',  meaning: '👍 Tốt, Hay',      strokes: 6  },
      { char: '大', pinyin: 'dà',   meaning: '⬆️ To, Lớn',       strokes: 3  },
      { char: '小', pinyin: 'xiǎo', meaning: '⬇️ Nhỏ, Bé',       strokes: 3  },
      { char: '多', pinyin: 'duō',  meaning: '➕ Nhiều',          strokes: 6  },
      { char: '少', pinyin: 'shǎo', meaning: '➖ Ít',             strokes: 4  },
      { char: '不', pinyin: 'bù',   meaning: '❌ Không',          strokes: 4  },
      { char: '这', pinyin: 'zhè',  meaning: '👆 Này, Đây',       strokes: 7  },
      { char: '那', pinyin: 'nà',   meaning: '👉 Kia, Đó',        strokes: 6  },
      { char: '哪', pinyin: 'nǎ',   meaning: '❓ Nào, Đâu',       strokes: 9  },
      { char: '谁', pinyin: 'shéi', meaning: '🤷 Ai',             strokes: 10 },
      { char: '什', pinyin: 'shén', meaning: '🔍 Cái gì (什么)',  strokes: 4  },
      { char: '么', pinyin: 'me',   meaning: '🔍 Gì (什么)',      strokes: 3  },
    ]
  },
];

// Bảng màu nét chữ lấy cảm hứng từ banner: Trung Hoa cổ điển
const STROKE_COLORS = [
  '#c95f66', // cinnabar đỏ
  '#4e88ad', // blueprint xanh dương
  '#78b7a5', // celadon xanh ngọc
  '#d6a85a', // gold vàng
  '#8e6bbf', // tím oải hương
  '#e0875a', // cam đất nung
  '#5a9e6f', // xanh lá trà
  '#b85c8a', // hồng sen
  '#6b9ad4', // xanh lam nhạt
  '#c9934f', // vàng nâu
];
