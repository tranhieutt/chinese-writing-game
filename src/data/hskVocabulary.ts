export interface Character {
  char: string;
  pinyin: string;
  meaning: string;
  strokes: number;
}

export interface Group {
  id: string;
  label: string;
  icon: string;
  chars: Character[];
}

export interface HskLevelData {
  groups: Group[];
}

export const hskVocabulary: Record<string, HskLevelData> = {
  hsk1: {
    groups: [
      {
        id: "numbers",
        label: "Số đếm & Lượng từ",
        icon: "🔢",
        chars: [
          { char: "零", pinyin: "líng", meaning: "0️⃣ Không, Số 0", strokes: 13 },
          { char: "一", pinyin: "yī", meaning: "1️⃣ Một", strokes: 1 },
          { char: "二", pinyin: "èr", meaning: "2️⃣ Hai", strokes: 2 },
          { char: "三", pinyin: "sān", meaning: "3️⃣ Ba", strokes: 3 },
          { char: "四", pinyin: "sì", meaning: "4️⃣ Bốn", strokes: 5 },
          { char: "五", pinyin: "wǔ", meaning: "5️⃣ Năm", strokes: 4 },
          { char: "六", pinyin: "liù", meaning: "6️⃣ Sáu", strokes: 4 },
          { char: "七", pinyin: "qī", meaning: "7️⃣ Bảy", strokes: 2 },
          { char: "八", pinyin: "bā", meaning: "8️⃣ Tám", strokes: 2 },
          { char: "九", pinyin: "jiǔ", meaning: "9️⃣ Chín", strokes: 2 },
          { char: "十", pinyin: "shí", meaning: "🔟 Mười", strokes: 2 },
          { char: "百", pinyin: "bǎi", meaning: "💯 Trăm", strokes: 6 },
          { char: "千", pinyin: "qiān", meaning: "🔢 Nghìn", strokes: 3 },
          { char: "几", pinyin: "jǐ", meaning: "❓ Mấy, vài", strokes: 2 },
          { char: "多", pinyin: "duō", meaning: "➕ Nhiều", strokes: 6 },
          { char: "少", pinyin: "shǎo", meaning: "➖ Ít", strokes: 4 },
          { char: "个", pinyin: "gè", meaning: "🔢 Lượng từ chung", strokes: 3 },
          { char: "本", pinyin: "běn", meaning: "📘 Quyển, gốc", strokes: 5 },
          { char: "点", pinyin: "diǎn", meaning: "🕐 Điểm, giờ", strokes: 9 },
          { char: "块", pinyin: "kuài", meaning: "💴 Đồng, miếng", strokes: 7 },
          { char: "岁", pinyin: "suì", meaning: "🎂 Tuổi", strokes: 6 }
        ]
      },
      {
        id: "pronouns-particles",
        label: "Đại từ & Trợ từ",
        icon: "💬",
        chars: [
          { char: "我", pinyin: "wǒ", meaning: "🙋 Tôi, Mình", strokes: 7 },
          { char: "你", pinyin: "nǐ", meaning: "👉 Bạn, Anh/Chị", strokes: 7 },
          { char: "他", pinyin: "tā", meaning: "👨 Anh ấy, Ông ấy", strokes: 5 },
          { char: "她", pinyin: "tā", meaning: "👩 Cô ấy, Bà ấy", strokes: 6 },
          { char: "们", pinyin: "men", meaning: "👥 Chúng, các", strokes: 5 },
          { char: "这", pinyin: "zhè", meaning: "👆 Này, Đây", strokes: 7 },
          { char: "那", pinyin: "nà", meaning: "👉 Kia, Đó", strokes: 6 },
          { char: "哪", pinyin: "nǎ", meaning: "❓ Nào, Đâu", strokes: 9 },
          { char: "谁", pinyin: "shéi", meaning: "🤷 Ai", strokes: 10 },
          { char: "什", pinyin: "shén", meaning: "🔍 Cái gì (什么)", strokes: 4 },
          { char: "么", pinyin: "me", meaning: "🔍 Gì (String)", strokes: 3 },
          { char: "吗", pinyin: "ma", meaning: "❓ Trợ từ hỏi", strokes: 6 },
          { char: "呢", pinyin: "ne", meaning: "❓ Trợ từ hỏi", strokes: 8 },
          { char: "的", pinyin: "de", meaning: "🔗 Trợ từ sở hữu", strokes: 8 },
          { char: "了", pinyin: "le", meaning: "✅ Trợ từ hoàn thành", strokes: 2 },
          { char: "都", pinyin: "dōu", meaning: "🔁 Đều, tất cả", strokes: 10 },
          { char: "不", pinyin: "bù", meaning: "❌ Không", strokes: 4 },
          { char: "没", pinyin: "méi", meaning: "🚫 Không có, chưa", strokes: 7 },
          { char: "很", pinyin: "hěn", meaning: "⭐ Rất", strokes: 9 },
          { char: "太", pinyin: "tài", meaning: "📈 Quá, rất", strokes: 4 },
          { char: "些", pinyin: "xiē", meaning: "🔢 Một vài", strokes: 8 },
          { char: "和", pinyin: "hé", meaning: "➕ Và, cùng", strokes: 8 }
        ]
      },
      {
        id: "people-family",
        label: "Con người & Gia đình",
        icon: "👨‍👩‍👧",
        chars: [
          { char: "人", pinyin: "rén", meaning: "👤 Người", strokes: 2 },
          { char: "爸", pinyin: "bà", meaning: "👨 Bố, Ba", strokes: 8 },
          { char: "妈", pinyin: "mā", meaning: "👩 Mẹ, Má", strokes: 6 },
          { char: "儿", "pinyin": "ér", "meaning": "👦 Con, Con trai", "strokes": 2 },
          { char: "女", "pinyin": "nǚ", "meaning": "👧 Nữ, Con gái", "strokes": 3 },
          { char: "子", "pinyin": "zi", "meaning": "👶 Con, hậu tố", "strokes": 3 },
          { char: "姐", "pinyin": "jiě", "meaning": "👩 Chị gái", "strokes": 8 },
          { char: "先", "pinyin": "xiān", "meaning": "🥇 Trước, tiên sinh", "strokes": 6 },
          { char: "生", "pinyin": "shēng", "meaning": "🎓 Sinh, Học sinh", "strokes": 5 },
          { char: "老", "pinyin": "lǎo", "meaning": "👴 Già, thầy", "strokes": 6 },
          { char: "师", "pinyin": "shī", "meaning": "👩‍🏫 Thầy, Sư", "strokes": 6 },
          { char: "朋", "pinyin": "péng", "meaning": "🤝 Bạn", "strokes": 8 },
          { char: "友", "pinyin": "yǒu", "meaning": "🤝 Bạn, Bằng hữu", "strokes": 4 },
          { char: "同", "pinyin": "tóng", "meaning": "👥 Cùng", "strokes": 6 },
          { char: "学", "pinyin": "xue", "meaning": "📖 Học", "strokes": 8 },
          { char: "医", "pinyin": "yī", "meaning": "⚕️ Y, bác sĩ", "strokes": 7 },
          { char: "客", "pinyin": "kè", "meaning": "🙋 Khách", "strokes": 9 },
          { char: "名", "pinyin": "míng", "meaning": "🏷️ Tên", "strokes": 6 }
        ]
      },
      {
        id: "time",
        label: "Thời gian & Lịch",
        icon: "🕐",
        chars: [
          { char: "年", pinyin: "nián", meaning: "📅 Năm", strokes: 6 },
          { char: "月", pinyin: "yuè", meaning: "🌙 Tháng", strokes: 4 },
          { char: "日", pinyin: "rì", meaning: "📆 Ngày", strokes: 4 },
          { char: "时", pinyin: "shí", meaning: "🕐 Giờ", strokes: 7 },
          { char: "分", pinyin: "fēn", meaning: "⏱️ Phút", strokes: 4 },
          { char: "钟", pinyin: "zhōng", meaning: "⏰ Đồng hồ, chuông", strokes: 9 },
          { char: "今", pinyin: "jīn", meaning: "📌 Hôm nay", strokes: 4 },
          { char: "天", pinyin: "tiān", meaning: "🌤️ Trời, Ngày", strokes: 4 },
          { char: "明", pinyin: "míng", meaning: "🌅 Ngày mai, Sáng", strokes: 8 },
          { char: "昨", pinyin: "zuó", meaning: "⬅️ Hôm qua", strokes: 9 },
          { char: "早", pinyin: "zǎo", meaning: "🌄 Buổi sáng", strokes: 6 },
          { char: "晚", pinyin: "wǎn", meaning: "🌆 Buổi tối", strokes: 11 },
          { char: "上", pinyin: "shàng", meaning: "⬆️ Trên, Sáng", strokes: 3 },
          { char: "下", pinyin: "xià", meaning: "⬇️ Dưới, Chiều", strokes: 3 },
          { char: "午", pinyin: "wǔ", meaning: "☀️ Trưa, Ngọ", strokes: 4 },
          { char: "中", pinyin: "zhōng", meaning: "🇨🇳 Trung, giữa", strokes: 4 },
          { char: "现", pinyin: "xiàn", meaning: "⏱️ Hiện", strokes: 8 },
          { char: "在", pinyin: "zài", meaning: "📍 Ở, đang", strokes: 6 },
          { char: "再", pinyin: "zài", meaning: "🔁 Lại, nữa", strokes: 6 },
          { char: "星", pinyin: "xīng", meaning: "⭐ Sao", strokes: 9 },
          { char: "期", pinyin: "qī", meaning: "📅 Kỳ, tuần", strokes: 12 },
          { char: "候", pinyin: "hou", meaning: "⏳ Lúc, chờ", strokes: 10 }
        ]
      },
      {
        id: "places-directions",
        label: "Địa điểm & Phương hướng",
        icon: "🧭",
        chars: [
          { char: "北", pinyin: "běi", meaning: "🧭 Bắc", strokes: 5 },
          { char: "京", pinyin: "jīng", meaning: "🏙️ Kinh đô", strokes: 8 },
          { char: "国", pinyin: "guó", meaning: "🌏 Quốc gia", strokes: 8 },
          { char: "东", pinyin: "dōng", meaning: "➡️ Đông", strokes: 5 },
          { char: "西", pinyin: "xī", meaning: "⬅️ Tây, đồ vật", strokes: 6 },
          { char: "前", pinyin: "qián", meaning: "➡️ Trước", strokes: 9 },
          { char: "后", pinyin: "hòu", meaning: "⬅️ Sau", strokes: 6 },
          { char: "面", "pinyin": "miàn", "meaning": "🧭 Mặt, phía", "strokes": 9 },
          { char: "里", "pinyin": "lǐ", "meaning": "📍 Trong", "strokes": 7 },
          { char: "家", "pinyin": "jiā", "meaning": "🏠 Nhà, Gia đình", "strokes": 10 },
          { char: "校", "pinyin": "xiào", "meaning": "🏫 Trường", "strokes": 10 },
          { char: "院", "pinyin": "yuàn", "meaning": "🏥 Viện", "strokes": 9 },
          { char: "商", "pinyin": "shāng", "meaning": "🏪 Buôn bán", "strokes": 11 },
          { char: "店", "pinyin": "diàn", "meaning": "🏬 Cửa hàng", "strokes": 8 },
          { char: "馆", "pinyin": "guǎn", "meaning": "🏬 Quán, nhà hàng", "strokes": 11 },
          { char: "火", "pinyin": "huǒ", "meaning": "🔥 Lửa", "strokes": 4 },
          { char: "车", "pinyin": "chē", "meaning": "🚗 Xe", "strokes": 4 },
          { char: "站", "pinyin": "zhàn", "meaning": "🚉 Trạm, đứng", "strokes": 10 }
        ]
      },
      {
        id: "food-drink",
        label: "Ăn uống",
        icon: "🍚",
        chars: [
          { char: "水", pinyin: "shuǐ", meaning: "💧 Nước", strokes: 4 },
          { char: "茶", pinyin: "chá", meaning: "🍵 Trà", strokes: 9 },
          { char: "饭", pinyin: "fàn", meaning: "🍚 Cơm, Bữa ăn", strokes: 7 },
          { char: "米", pinyin: "mǐ", meaning: "🍚 Gạo, mét", strokes: 6 },
          { char: "菜", pinyin: "cài", meaning: "🥬 Món ăn, rau", strokes: 11 },
          { char: "果", pinyin: "guǒ", meaning: "🍎 Quả, Kết quả", strokes: 8 },
          { char: "苹", pinyin: "píng", meaning: "🍎 Táo", strokes: 8 },
          { char: "吃", pinyin: "chī", meaning: "🍽️ Ăn", strokes: 6 },
          { char: "喝", pinyin: "hē", meaning: "🥤 Uống", strokes: 12 }
        ]
      },
      {
        id: "transport-objects",
        label: "Đồ vật & Phương tiện",
        icon: "🚗",
        chars: [
          { char: "出", pinyin: "chū", meaning: "↗️ Ra, xuất", strokes: 5 },
          { char: "租", pinyin: "zū", meaning: "🚕 Thuê", strokes: 10 },
          { char: "飞", pinyin: "fēi", meaning: "✈️ Bay", strokes: 3 },
          { char: "机", pinyin: "jī", meaning: "⚙️ Máy", strokes: 6 },
          { char: "电", pinyin: "diàn", meaning: "⚡ Điện", strokes: 5 },
          { char: "脑", pinyin: "nǎo", meaning: "🧠 Não", strokes: 10 },
          { char: "视", pinyin: "shì", meaning: "📺 Nhìn, thị", strokes: 8 },
          { char: "影", pinyin: "yǐng", meaning: "🎬 Bóng, phim", strokes: 15 },
          { char: "话", pinyin: "huà", meaning: "💬 Lời nói", strokes: 8 },
          { char: "书", pinyin: "shū", meaning: "📚 Sách", strokes: 4 },
          { char: "字", pinyin: "zì", meaning: "✍️ Chữ", strokes: 6 },
          { char: "桌", pinyin: "zhuō", meaning: "🪑 Bàn", strokes: 10 },
          { char: "椅", "pinyin": "yǐ", "meaning": "🪑 Ghế", "strokes": 12 },
          { char: "衣", "pinyin": "yī", "meaning": "👕 Áo, quần áo", "strokes": 6 },
          { char: "服", "pinyin": "fu", "meaning": "👕 Trang phục", "strokes": 8 },
          { char: "杯", "pinyin": "bēi", "meaning": "🥤 Cốc, ly", "strokes": 8 },
          { char: "门", "pinyin": "mén", "meaning": "🚪 Cửa", "strokes": 3 },
          { char: "钱", "pinyin": "qián", "meaning": "💰 Tiền", strokes: 10 }
        ]
      },
      {
        id: "verbs-actions",
        label: "Động từ & Hành động",
        icon: "🗣️",
        chars: [
          { char: "是", pinyin: "shì", meaning: "✅ Là, Đúng", strokes: 9 },
          { char: "有", pinyin: "yǒu", meaning: "🫴 Có", strokes: 6 },
          { char: "来", pinyin: "lái", meaning: "➡️ Đến, Lại", strokes: 7 },
          { char: "去", pinyin: "qù", meaning: "🚶 Đi", strokes: 5 },
          { char: "看", pinyin: "kàn", meaning: "👀 Xem, Nhìn", strokes: 9 },
          { char: "见", pinyin: "jiàn", meaning: "👀 Thấy, gặp", strokes: 4 },
          { char: "听", pinyin: "tīng", meaning: "👂 Nghe", strokes: 7 },
          { char: "说", pinyin: "shuō", meaning: "💬 Nói", strokes: 9 },
          { char: "写", "pinyin": "xiě", "meaning": "✏️ Viết", "strokes": 5 },
          { char: "读", "pinyin": "dú", "meaning": "📖 Đọc", strokes: 10 },
          { char: "习", "pinyin": "xí", "meaning": "📖 Luyện, học", strokes: 3 },
          { char: "工", "pinyin": "gōng", "meaning": "🛠️ Công, việc", strokes: 3 },
          { char: "作", "pinyin": "zuò", "meaning": "💼 Làm, công việc", strokes: 7 },
          { char: "做", "pinyin": "zuò", "meaning": "🛠️ Làm", strokes: 11 },
          { char: "叫", "pinyin": "jiào", "meaning": "📣 Gọi, tên là", strokes: 5 },
          { char: "开", "pinyin": "kāi", "meaning": "🔓 Mở, bắt đầu", strokes: 4 },
          { char: "回", "pinyin": "huí", "meaning": "↩️ Quay về", strokes: 6 },
          { char: "会", "pinyin": "huì", "meaning": "✅ Biết, có thể", strokes: 6 },
          { char: "能", "pinyin": "néng", "meaning": "💪 Có thể", strokes: 10 },
          { char: "想", "pinyin": "xiǎng", "meaning": "💭 Muốn, nghĩ", strokes: 13 },
          { char: "认", "pinyin": "rèn", "meaning": "👁️ Nhận", strokes: 4 },
          { char: "识", "pinyin": "shi", "meaning": "🧠 Biết, nhận thức", strokes: 7 },
          { char: "喜", "pinyin": "xǐ", "meaning": "😊 Vui, thích", strokes: 12 },
          { char: "欢", "pinyin": "huan", "meaning": "😊 Thích, vui", strokes: 6 },
          { char: "请", "pinyin": "qǐng", "meaning": "🙏 Mời, xin", strokes: 10 },
          { char: "买", "pinyin": "mǎi", "meaning": "🛒 Mua", strokes: 6 },
          { char: "住", "pinyin": "zhù", "meaning": "🏠 Sống, ở", strokes: 7 },
          { char: "坐", "pinyin": "zuò", "meaning": "🪑 Ngồi", strokes: 7 },
          { char: "睡", "pinyin": "shuì", "meaning": "😴 Ngủ", strokes: 13 },
          { char: "觉", "pinyin": "jiào", "meaning": "😴 Giấc, cảm thấy", strokes: 9 },
          { char: "打", "pinyin": "dǎ", "meaning": "📞 Đánh, gọi", strokes: 5 },
          { char: "喂", "pinyin": "wèi", "meaning": "☎️ A lô", strokes: 12 },
          { char: "谢", "pinyin": "xiè", "meaning": "🙏 Cảm ơn", strokes: 12 }
        ]
      },
      {
        id: "adjectives-states",
        label: "Tính chất & Trạng thái",
        icon: "✨",
        chars: [
          { char: "好", pinyin: "hǎo", meaning: "👍 Tốt, Hay", strokes: 6 },
          { char: "大", pinyin: "dà", meaning: "⬆️ To, Lớn", strokes: 3 },
          { char: "小", pinyin: "xiǎo", meaning: "⬇️ Nhỏ, Bé", strokes: 3 },
          { char: "冷", pinyin: "lěng", meaning: "🥶 Lạnh", strokes: 7 },
          { char: "热", pinyin: "rè", meaning: "🥵 Nóng", strokes: 10 },
          { char: "高", "pinyin": "gāo", meaning: "📈 Cao", strokes: 10 },
          { char: "興", "pinyin": "xìng", meaning: "😊 Hứng, vui", strokes: 6 },
          { char: "漂", "pinyin": "piào", meaning: "✨ Đẹp, trôi", strokes: 14 },
          { char: "亮", "pinyin": "liang", meaning: "💡 Sáng, đẹp", strokes: 9 },
          { char: "爱", "pinyin": "ài", meaning: "❤️ Yêu, thích", strokes: 10 },
          { char: "对", "pinyin": "duì", meaning: "✅ Đúng, đối với", strokes: 5 },
          { char: "起", "pinyin": "qǐ", meaning: "⬆️ Dậy, bắt đầu", strokes: 10 },
          { char: "气", "pinyin": "qì", meaning: "🌬️ Khí, hơi", strokes: 4 },
          { char: "关", "pinyin": "guān", meaning: "🔒 Quan, đóng", strokes: 6 },
          { char: "系", "pinyin": "xi", "meaning": "🔗 Quan hệ, buộc", strokes: 7 },
          { char: "怎", "pinyin": "zěn", "meaning": "❓ Thế nào", strokes: 9 },
          { char: "样", "pinyin": "yàng", "meaning": "🧩 Dạng, kiểu", strokes: 10 }
        ]
      },
      {
        id: "nature-legacy",
        label: "Thiên nhiên mở rộng",
        icon: "🌿",
        chars: [
          { char: "地", pinyin: "dì", meaning: "🌍 Đất, Địa", strokes: 6 },
          { char: "山", "pinyin": "shān", meaning: "⛰️ Núi", strokes: 3 },
          { char: "木", "pinyin": "mù", meaning: "🌳 Cây, Gỗ", strokes: 4 },
          { char: "风", "pinyin": "fēng", meaning: "💨 Gió", strokes: 4 },
          { char: "云", "pinyin": "yún", meaning: "☁️ Mây", strokes: 4 },
          { char: "雨", "pinyin": "yǔ", meaning: "🌧️ Mưa", strokes: 8 },
          { char: "雪", "pinyin": "xuě", meaning: "❄️ Tuyết", strokes: 11 },
          { char: "猫", "pinyin": "māo", meaning: "🐱 Mèo", strokes: 11 },
          { char: "狗", "pinyin": "gǒu", meaning: "🐶 Chó", strokes: 8 },
          { char: "汉", "pinyin": "hàn", meaning: "🇨🇳 Hán", strokes: 5 },
          { char: "语", "pinyin": "yǔ", meaning: "🗣️ Ngôn ngữ", strokes: 9 }
        ]
      }
    ]
  },
  hsk2: {
    groups: [
      {
        id: "hsk2-pronouns",
        label: "Đại từ & Chỉ định",
        icon: "👉",
        chars: [
          { char: "您", pinyin: "nín", meaning: "👴 Ông, bà, ngài", strokes: 11 },
          { char: "它", pinyin: "tā", meaning: "🐕 Nó, con vật", strokes: 5 },
          { char: "每", pinyin: "měi", meaning: "🗓️ Mỗi, mọi", strokes: 7 },
          { char: "俩", pinyin: "liǎ", meaning: "👥 Cặp, hai người", strokes: 9 },
          { char: "旁", pinyin: "páng", meaning: "📍 Bên cạnh", strokes: 10 },
          { char: "边", pinyin: "biān", meaning: "🧭 Phía, biên", strokes: 5 },
          { char: "别", pinyin: "bié", meaning: "❌ Đừng, cái khác", strokes: 7 }
        ]
      },
      {
        id: "hsk2-family",
        label: "Gia đình & Sức khỏe",
        icon: "❤️",
        chars: [
          { char: "哥", pinyin: "gē", meaning: "👦 Anh trai", strokes: 10 },
          { char: "弟", pinyin: "dì", meaning: "👦 Em trai", strokes: 7 },
          { char: "妹", pinyin: "mèi", meaning: "👧 Em gái", strokes: 8 },
          { char: "奶", pinyin: "nǎi", meaning: "👵 Bà nội", strokes: 5 },
          { char: "爷", pinyin: "yé", meaning: "👴 Ông nội", strokes: 6 },
          { char: "妻", pinyin: "qī", meaning: "👩 Vợ, thê", strokes: 8 },
          { char: "夫", pinyin: "fū", meaning: "👨 Chồng, phu", strokes: 4 },
          { char: "身", pinyin: "shēn", meaning: "👤 Thân thể, mình", strokes: 7 },
          { char: "病", pinyin: "bìng", meaning: "🤒 Bệnh, ốm", strokes: 10 },
          { char: "药", pinyin: "yào", meaning: "💊 Thuốc", strokes: 9 }
        ]
      },
      {
        id: "hsk2-actions",
        label: "Động từ hoạt động",
        icon: "🏃",
        chars: [
          { char: "玩", pinyin: "wán", meaning: "🧸 Chơi, đùa", strokes: 8 },
          { char: "踢", pinyin: "tī", meaning: "⚽ Đá (bóng)", strokes: 15 },
          { char: "跑", pinyin: "pǎo", meaning: "🏃 Chạy", strokes: 12 },
          { char: "步", pinyin: "bù", meaning: "🚶 Bước, đi bộ", strokes: 7 },
          { char: "游", pinyin: "yóu", meaning: "🏊 Du ngoạn, bơi", strokes: 12 },
          { char: "泳", pinyin: "yǒng", meaning: "🏊 Bơi", strokes: 8 },
          { char: "唱", pinyin: "chàng", meaning: "🎤 Hát", strokes: 11 },
          { char: "歌", pinyin: "gē", meaning: "🎵 Bài hát", strokes: 14 },
          { char: "跳", pinyin: "tiào", meaning: "💃 Nhảy", strokes: 13 },
          { char: "舞", pinyin: "wǔ", meaning: "💃 Khiêu vũ", strokes: 14 }
        ]
      },
      {
        id: "hsk2-travel",
        label: "Du lịch & Giao thông",
        icon: "✈️",
        chars: [
          { char: "旅", pinyin: "lǚ", meaning: "✈️ Du lịch", strokes: 10 },
          { char: "票", pinyin: "piào", meaning: "🎫 Vé", strokes: 11 },
          { char: "汽", pinyin: "qì", meaning: "🚗 Hơi nước, ô tô", strokes: 7 },
          { char: "船", pinyin: "chuán", meaning: "🚢 Thuyền, tàu", strokes: 11 },
          { char: "公", pinyin: "gōng", meaning: "👥 Công cộng", strokes: 4 },
          { char: "路", pinyin: "lù", meaning: "🛣️ Đường đi", strokes: 13 },
          { char: "场", pinyin: "chǎng", meaning: "🏟️ Sân bãi", strokes: 6 }
        ]
      },
      {
        id: "hsk2-study",
        label: "Học tập & Công việc",
        icon: "📝",
        chars: [
          { char: "报", pinyin: "bào", meaning: "📰 Báo chí, báo cáo", strokes: 7 },
          { char: "纸", pinyin: "zhǐ", meaning: "📄 Giấy", strokes: 7 },
          { char: "试", pinyin: "shì", meaning: "📝 Thử, thi", strokes: 8 },
          { char: "考", pinyin: "kǎo", meaning: "📝 Thi, khảo sát", strokes: 6 },
          { char: "题", pinyin: "tí", meaning: "📋 Đề bài, câu hỏi", strokes: 15 },
          { char: "懂", pinyin: "dǒng", meaning: "💡 Hiểu, rõ", strokes: 15 },
          { char: "错", pinyin: "cuò", meaning: "❌ Sai, hỏng", strokes: 8 },
          { char: "完", pinyin: "wán", meaning: "🏁 Hoàn thành, hết", strokes: 7 },
          { char: "准", pinyin: "zhǔn", meaning: "🎯 Chuẩn, cho phép", strokes: 10 },
          { char: "备", pinyin: "bèi", meaning: "📦 Chuẩn bị, sẵn sàng", strokes: 8 },
          { char: "介", pinyin: "jiè", meaning: "🤝 Giới thiệu, ở giữa", strokes: 4 },
          { char: "绍", pinyin: "shào", meaning: "🤝 Thiệu, nối tiếp", strokes: 8 }
        ]
      },
      {
        id: "hsk2-communication",
        label: "Trạng thái giao tiếp",
        icon: "🤝",
        chars: [
          { char: "帮", pinyin: "bāng", meaning: "🤝 Giúp đỡ", strokes: 9 },
          { char: "助", pinyin: "zhù", meaning: "🤝 Trợ giúp", strokes: 7 },
          { char: "希", pinyin: "xī", meaning: "🌟 Hy vọng, hiếm", strokes: 7 },
          { char: "望", pinyin: "wàng", meaning: "🌟 Mong mỏi, ngóng", strokes: 11 },
          { char: "等", pinyin: "děng", meaning: "⏳ Chờ, đợi, bằng", strokes: 12 },
          { char: "让", pinyin: "ràng", meaning: "➡️ Nhường, để, cho phép", strokes: 5 },
          { char: "使", pinyin: "shǐ", meaning: "➡️ Sử dụng, khiến cho", strokes: 8 },
          { char: "送", pinyin: "sòng", meaning: "🎁 Tặng, đưa tiễn", strokes: 9 },
          { char: "找", pinyin: "zhǎo", meaning: "🔍 Tìm kiếm", strokes: 7 },
          { char: "办", pinyin: "bàn", meaning: "🛠️ Làm, giải quyết", strokes: 4 },
          { char: "宾", pinyin: "bīn", meaning: "🙋 Khách, tân khách", strokes: 10 }
        ]
      },
      {
        id: "hsk2-nature",
        label: "Thời tiết & Thiên nhiên",
        icon: "☁️",
        chars: [
          { char: "阴", pinyin: "yīn", meaning: "☁️ Âm, u ám", strokes: 6 },
          { char: "晴", pinyin: "qíng", meaning: "☀️ Nắng, trời trong", strokes: 12 },
          { char: "两", pinyin: "liǎng", meaning: "🔢 Hai (lượng từ)", strokes: 7 },
          { char: "第", pinyin: "dì", meaning: "🥇 Thứ (số thứ tự)", strokes: 11 }
        ]
      },
      {
        id: "hsk2-states",
        label: "Đo lường & Từ khác",
        icon: "📏",
        chars: [
          { char: "慢", pinyin: "màn", meaning: "🐢 Chậm", strokes: 14 },
          { char: "快", pinyin: "kuài", meaning: "⚡ Nhanh", strokes: 7 },
          { char: "贵", pinyin: "guì", meaning: "💰 Đắt, quý", strokes: 9 },
          { char: "便", pinyin: "biàn", meaning: "🏷️ Tiện lợi, rẻ", strokes: 9 },
          { char: "宜", pinyin: "yí", meaning: "🏷️ Thích hợp, rẻ", strokes: 8 },
          { char: "近", pinyin: "jìn", meaning: "📍 Gần", strokes: 7 },
          { char: "远", pinyin: "yuǎn", meaning: "🗺️ Xa", strokes: 7 },
          { char: "离", pinyin: "lí", meaning: "🧭 Cách, rời lìa", strokes: 10 },
          { char: "往", pinyin: "wǎng", meaning: "➡️ Hướng về, đi", strokes: 8 },
          { char: "向", pinyin: "xiàng", meaning: "➡️ Hướng về, phía", strokes: 6 }
        ]
      }
    ]
  },
  hsk3: {
    groups: [
      {
        id: "hsk3-emotions",
        label: "Cảm xúc & Tâm trạng",
        icon: "😭",
        chars: [
          { char: "极", pinyin: "jí", meaning: "📈 Cực kỳ, hết mức", strokes: 7 },
          { char: "差", pinyin: "chà", meaning: "📉 Kém, tồi", strokes: 9 },
          { char: "饱", pinyin: "bǎo", meaning: "🍲 No bụng", strokes: 8 },
          { char: "渴", pinyin: "kě", meaning: "🥤 Khát nước", strokes: 12 },
          { char: "饿", pinyin: "è", meaning: "🍽️ Đói bụng", strokes: 10 },
          { char: "甜", pinyin: "tián", meaning: "🍬 Ngọt ngào", strokes: 11 },
          { char: "酸", pinyin: "suān", meaning: "🍋 Chua", strokes: 14 },
          { char: "辣", pinyin: "là", meaning: "🌶️ Cay", strokes: 14 },
          { char: "哭", pinyin: "kū", meaning: "😭 Khóc", strokes: 10 },
          { char: "笑", pinyin: "xiào", meaning: "😄 Cười", strokes: 10 },
          { char: "怒", pinyin: "nù", meaning: "😡 Giận dữ", strokes: 9 },
          { char: "怕", pinyin: "pà", meaning: "😨 Sợ hãi", strokes: 8 },
          { char: "疼", pinyin: "téng", meaning: "🤕 Đau đớn", strokes: 10 }
        ]
      },
      {
        id: "hsk3-places",
        label: "Vị trí & Địa điểm",
        icon: "🏢",
        chars: [
          { char: "楼", pinyin: "lóu", meaning: "🏢 Tòa nhà, lầu", strokes: 13 },
          { char: "层", pinyin: "céng", meaning: "🏢 Tầng, lớp", strokes: 7 },
          { char: "梯", pinyin: "tī", meaning: "🪜 Thang", strokes: 11 },
          { char: "宿", pinyin: "sù", meaning: "🛏️ Trọ, ngủ đêm", strokes: 11 },
          { char: "舍", pinyin: "shè", meaning: "🏠 Nhà ở, ký túc", strokes: 8 },
          { char: "室", pinyin: "shì", meaning: "🏫 Phòng", strokes: 9 },
          { char: "银", pinyin: "yín", meaning: "🪙 Bạc, ngân hàng", strokes: 11 },
          { char: "行", pinyin: "xíng", meaning: "🏦 Hàng, đi", strokes: 6 }
        ]
      },
      {
        id: "hsk3-travel",
        label: "Giao thông & Đi lại",
        icon: "🚇",
        chars: [
          { char: "铁", pinyin: "tiě", meaning: "🚇 Sắt, đường sắt", strokes: 10 },
          { char: "航", pinyin: "háng", meaning: "✈️ Hàng hải, bay", strokes: 10 },
          { char: "班", pinyin: "bān", meaning: "👥 Lớp, chuyến bay", strokes: 10 },
          { char: "护", pinyin: "hù", meaning: "🛡️ Bảo vệ, hộ chiếu", strokes: 7 },
          { char: "照", pinyin: "zhào", meaning: "📸 Chiếu sáng, ảnh", strokes: 13 },
          { char: "李", pinyin: "lǐ", meaning: "🍑 Lý, hành lý", strokes: 7 },
          { char: "箱", pinyin: "xiāng", meaning: "📦 Hòm, vali", strokes: 15 }
        ]
      },
      {
        id: "hsk3-shopping",
        label: "Mua sắm & Đồ đạc",
        icon: "🌂",
        chars: [
          { char: "伞", pinyin: "sǎn", meaning: "🌂 Ô, dù", strokes: 6 },
          { char: "筷", pinyin: "kuài", meaning: "🥢 Đũa", strokes: 13 },
          { char: "碗", pinyin: "wǎn", meaning: "🥣 Bát", strokes: 13 },
          { char: "盘", pinyin: "pán", meaning: "🍽️ Đĩa, khay", strokes: 11 },
          { char: "刷", pinyin: "shuā", meaning: "🪥 Chải, bàn chải", strokes: 8 },
          { char: "牙", pinyin: "yá", meaning: "🦷 Răng", strokes: 4 },
          { char: "膏", pinyin: "gāo", meaning: "🧴 Kem, thuốc mỡ", strokes: 14 },
          { char: "镜", pinyin: "jìng", meaning: "🪞 Gương, kính", strokes: 16 }
        ]
      },
      {
        id: "hsk3-nature",
        label: "Thiên nhiên & Động vật",
        icon: "🐼",
        chars: [
          { char: "熊", pinyin: "xióng", meaning: "🐻 Con gấu", strokes: 14 },
          { char: "鸟", pinyin: "niǎo", meaning: "🐦 Con chim", strokes: 5 },
          { char: "鱼", pinyin: "yú", meaning: "🐟 Con cá", strokes: 8 },
          { char: "树", pinyin: "shù", meaning: "🌳 Cây", strokes: 9 },
          { char: "草", pinyin: "cǎo", meaning: "🌱 Cỏ", strokes: 9 },
          { char: "花", pinyin: "huā", meaning: "🌸 Hoa, tiêu tiền", strokes: 7 },
          { char: "阳", pinyin: "yáng", meaning: "☀️ Dương, mặt trời", strokes: 6 }
        ]
      },
      {
        id: "hsk3-sports",
        label: "Học tập & Thể thao",
        icon: "💪",
        chars: [
          { char: "历", pinyin: "lì", meaning: "📅 Lịch sử, trải qua", strokes: 4 },
          { char: "史", pinyin: "shǐ", meaning: "📖 Lịch sử", strokes: 5 },
          { char: "体", pinyin: "tǐ", meaning: "👤 Thể chất, thân thể", strokes: 7 },
          { char: "育", pinyin: "yù", meaning: "🏫 Giáo dục, nuôi dưỡng", strokes: 8 },
          { char: "健", pinyin: "jiàn", meaning: "💪 Khỏe mạnh", strokes: 11 },
          { char: "康", pinyin: "kāng", meaning: "💪 An khang, khỏe", strokes: 11 },
          { char: "运", pinyin: "yùn", meaning: "🏃 Vận chuyển, vận động", strokes: 7 },
          { char: "动", pinyin: "dòng", meaning: "🏃 Động, di chuyển", strokes: 6 },
          { char: "锻", pinyin: "duàn", meaning: "🔨 Rèn luyện", strokes: 17 },
          { char: "炼", pinyin: "liàn", meaning: "🔥 Luyện, tôi luyện", strokes: 9 }
        ]
      },
      {
        id: "hsk3-society",
        label: "Xã hội & Công việc",
        icon: "💼",
        chars: [
          { char: "经", pinyin: "jīng", meaning: "💼 Kinh qua, quản lý", strokes: 8 },
          { char: "理", pinyin: "lǐ", meaning: "💼 Lý thuyết, quản lý", strokes: 11 },
          { char: "法", pinyin: "fǎ", meaning: "⚖️ Pháp luật, phương pháp", strokes: 8 },
          { char: "决", pinyin: "jué", meaning: "🎯 Quyết định", strokes: 6 },
          { char: "定", pinyin: "dìng", meaning: "🎯 Định ra, chắc chắn", strokes: 8 },
          { char: "选", pinyin: "xuǎn", meaning: "🗳️ Chọn lựa", strokes: 9 },
          { char: "择", pinyin: "zé", meaning: "🗳️ Lựa chọn", strokes: 8 },
          { char: "愿", pinyin: "yuàn", meaning: "🌟 Nguyện vọng, muốn", strokes: 14 },
          { char: "意", pinyin: "yì", meaning: "💭 Ý kiến, ý muốn", strokes: 13 },
          { char: "敢", pinyin: "gǎn", meaning: "💪 Dũng cảm, dám", strokes: 11 }
        ]
      },
      {
        id: "hsk3-frequency",
        label: "Thời gian & Tần suất",
        icon: "⚡",
        chars: [
          { char: "突", pinyin: "tū", meaning: "⚡ Đột nhiên", strokes: 9 },
          { char: "然", pinyin: "rán", meaning: "🍂 Tự nhiên, như vậy", strokes: 12 },
          { char: "终", pinyin: "zhōng", meaning: "🏁 Cuối cùng, kết thúc", strokes: 8 },
          { char: "于", pinyin: "yú", meaning: "📍 Ở, vào lúc", strokes: 3 },
          { char: "常", pinyin: "cháng", meaning: "🔁 Thường xuyên", strokes: 11 }
        ]
      }
    ]
  }
};

export const strokeColors = [
  "#c95f66",
  "#4e88ad",
  "#78b7a5",
  "#d6a85a",
  "#8e6bbf",
  "#e0875a",
  "#5a9e6f",
  "#b85c8a",
  "#6b9ad4",
  "#c9934f"
];
