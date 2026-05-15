const { v4: uuidv4 } = require('uuid');

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const templates = {
  casual: [
    'Hey everyone! ☕ {topic} is finally here and we are so excited to share it with you all! Come check it out!',
    'Good vibes only ✨ {topic} just dropped and honestly? It slaps. Come see for yourself!',
    'We have been working hard on {topic} and it is finally ready! Pop by and say hi 👋',
  ],
  professional: [
    'We are proud to announce {topic}. A milestone that reflects our commitment to excellence and quality.',
    'Introducing {topic} — crafted with precision, built for those who demand the best.',
    '{topic} is now available. We invite you to experience the difference firsthand.',
  ],
  playful: [
    '🎉 Guess what?! {topic} just happened and we can barely contain our excitement!! Come play with us!',
    'Something AMAZING is here 🥳 — {topic}! You don\'t want to miss this one, trust us!',
    'Ready for something fun? 🌈 {topic} is live and it\'s everything we promised and more!',
  ],
  inspirational: [
    'Every great journey starts with a single step. Today, {topic} marks ours. Join us.',
    'We believe in creating things that matter. {topic} is our latest expression of that belief.',
    'Dream big, act boldly. {topic} is the result of both — and we\'re sharing it with you.',
  ],
  minimalist: [
    '{topic}. Now available.',
    'Introducing {topic}.',
    '{topic} — simple, intentional, here.',
  ],
};

const templatesZh = {
  casual: [
    '大家好！☕ {topic} 终于来了，超开心和大家分享！快来看看吧！',
    '好心情分享 ✨ {topic} 上线啦，真的很棒。来亲自感受一下！',
    '我们一直在努力准备 {topic}，终于好了！欢迎来打卡 👋',
  ],
  professional: [
    '我们自豪地宣布 {topic} 正式推出，这是我们对卓越品质承诺的体现。',
    '隆重介绍 {topic} —— 精心打造，专为追求极致的您。',
    '{topic} 现已开放，诚邀您亲身体验。',
  ],
  playful: [
    '🎉 猜猜发生什么了？！{topic} 正式登场，我们激动得不行！快来一起玩！',
    '超级好消息来了 🥳 —— {topic}！千万不要错过哦！',
    '准备好了吗？🌈 {topic} 上线了，比承诺的还要精彩！',
  ],
  inspirational: [
    '每段伟大旅程都始于第一步。今天，{topic} 就是我们的起点。',
    '我们相信创造有意义的事物。{topic} 是这份信念的最新体现。',
    '敢于梦想，勇于行动。{topic} 正是这两者的结晶。',
  ],
  minimalist: [
    '{topic}，现已上线。',
    '隆重推出 {topic}。',
    '{topic} —— 简约、用心、到来。',
  ],
};

const hashtagsByTone = {
  casual: ['#GoodVibes', '#ComeSeeUs', '#NewNow', '#MustVisit', '#ExcitingNews'],
  professional: ['#Innovation', '#Excellence', '#NewLaunch', '#Quality', '#MadeWithPride'],
  playful: ['#FunTimes', '#SoExcited', '#DontMissOut', '#PartyTime', '#NewAndFun'],
  inspirational: ['#DreamBig', '#Inspired', '#MakeItHappen', '#NewBeginnings', '#Believe'],
  minimalist: ['#Simple', '#Minimal', '#Clean', '#Less', '#Now'],
};

const hashtagsZh = {
  casual: ['#好心情', '#打卡必去', '#新上线', '#快来看', '#超开心'],
  professional: ['#专业品质', '#全新推出', '#精心打造', '#值得信赖', '#高品质'],
  playful: ['#太好玩了', '#超兴奋', '#不要错过', '#快来玩', '#新鲜出炉'],
  inspirational: ['#梦想成真', '#勇于前行', '#新开始', '#相信自己', '#心之所向'],
  minimalist: ['#简约', '#精简', '#干净', '#少即是多', '#现在'],
};

function pickTemplate(bank, tone, usedBody) {
  const pool = bank[tone] || bank.casual;
  const unused = pool.filter((t) => t !== usedBody);
  const source = unused.length > 0 ? unused : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function buildCaption(id, label, topic, tone, language, usedBody = null) {
  const isZh = language === 'zh-hans' || language === 'zh-hant';
  const isBilingual = language === 'bilingual';
  const bank = isZh || isBilingual ? templatesZh : templates;
  const tags = isZh || isBilingual ? hashtagsZh[tone] || hashtagsZh.casual : hashtagsByTone[tone] || hashtagsByTone.casual;

  const rawBody = pickTemplate(bank, tone, usedBody).replace(/{topic}/g, topic || 'our latest update');
  const body = isBilingual
    ? rawBody + '\n\n' + pickTemplate(templates, tone, null).replace(/{topic}/g, topic || 'our latest update')
    : rawBody;

  return {
    id,
    label,
    body,
    hashtags: tags.slice(0, 5),
    charCount: body.length,
    source: 'ai',
  };
}

async function generateCaptions(session) {
  await delay(400 + Math.random() * 400);
  const { tone, language, captionCount, topic } = session.settings;
  const labels = ['A', 'B', 'C'].slice(0, captionCount);
  return labels.map((label, i) =>
    buildCaption('cap_' + label, label, topic, tone, language)
  );
}

async function regenerateCaption(session, captionId) {
  await delay(300 + Math.random() * 300);
  const { tone, language, topic } = session.settings;
  const existing = session.captions.find((c) => c.id === captionId);
  const label = existing ? existing.label : captionId.replace('cap_', '');
  return buildCaption(captionId, label, topic, tone, language, existing ? existing.body : null);
}

function adaptForPlatform(session, platform) {
  const selected = session.captions.find((c) => c.id === session.selectedCaptionId) || session.captions[0];
  if (!selected) return null;

  const { language } = session.settings;
  const isZh = language === 'zh-hans' || language === 'zh-hant' || language === 'bilingual';

  if (platform === 'xhs') {
    const body = selected.body.slice(0, 1000);
    const hashtags = isZh
      ? (hashtagsZh[session.settings.tone] || hashtagsZh.casual).slice(0, 5)
      : selected.hashtags.slice(0, 5);
    return { body, hashtags, charCount: body.length, charLimit: 1000, requiresManualConfirm: true, postMode: 'needs-confirm' };
  }
  if (platform === 'ig') {
    return { body: selected.body, hashtags: selected.hashtags, charCount: selected.charCount, charLimit: 2200, requiresManualConfirm: false, postMode: 'auto-post' };
  }
  if (platform === 'fb') {
    const body = selected.body + '\n\nVisit us today!';
    const hashtags = selected.hashtags.slice(0, 3);
    return { body, hashtags, charCount: body.length, charLimit: 63206, requiresManualConfirm: false, postMode: 'auto-post' };
  }
  return null;
}

module.exports = { generateCaptions, regenerateCaption, adaptForPlatform };
