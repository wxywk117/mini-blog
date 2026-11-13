/* =========================================================
 * 小记 MiniBlog · 交互逻辑
 * 分区：常量 → DOM → 状态 → 存储层 → 工具 → 业务 → 渲染 → 事件 → 初始化
 * ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. 常量配置 ---------- */
  var STORAGE_KEY = 'miniblog.posts.v1'; // 版本化存储键，结构变更时递增版本号
  var MAX_LEN = 280; // 单条内容字数上限
  var WARN_LEN = 250; // 接近上限的提醒阈值
  var MAX_RENDER = 200; // 单次渲染上限，避免极端数据量下的性能问题
  var TIME_TICK = 60000; // 相对时间刷新间隔（毫秒）
  var DELETE_ANIM = 180; // 删除动画时长（毫秒）
  var DEFAULT_AUTHOR = '我';
  var CONFIRM_TEXT = '确定删除这条动态吗？删除后不可恢复。';

  /* ---------- 2. DOM 引用 ---------- */
  var els = {
    topbar: document.getElementById('topbar'),
    input: document.getElementById('composer-input'),
    publishBtn: document.getElementById('publish-btn'),
    counter: document.getElementById('char-counter'),
    status: document.getElementById('status-message'),
    list: document.getElementById('post-list'),
    empty: document.getElementById('empty-state'),
    summary: document.getElementById('feed-summary'),
    badge: document.getElementById('post-count'),
    feed: document.querySelector('.mb-feed')
  };

  /* ---------- 3. 内存状态 ---------- */
  var posts = [];
  var storageReady = true;
  var statusTimer = null;

  /* ---------- 4. 存储层 ---------- */
  function detectStorage() {
    try {
      var probe = '__mb_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return true;
    } catch (err) {
      return false;
    }
  }

  /** 过滤并补全非法数据，保证渲染阶段字段始终完整 */
  function normalize(list) {
    if (!Array.isArray(list)) return [];
    return list
      .filter(function (item) {
        return (
          item &&
          typeof item.id === 'string' &&
          item.id.length > 0 &&
          typeof item.content === 'string' &&
          item.content.trim().length > 0 &&
          typeof item.createdAt === 'number' &&
          isFinite(item.createdAt)
        );
      })
      .map(function (item) {
        return {
          id: item.id,
          content: item.content,
          createdAt: item.createdAt,
          author: typeof item.author === 'string' && item.author ? item.author : DEFAULT_AUTHOR
        };
      });
  }

  function byCreatedAtDesc(a, b) {
    return b.createdAt - a.createdAt;
  }

  /** 读取本地数据；任何异常都降级为空列表，保证页面可用 */
  function loadPosts() {
    if (!storageReady) return [];
    var raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      storageReady = false;
      console.warn('[MiniBlog] 本地存储不可读取，已切换为内存模式。', err);
      return [];
    }
    if (!raw) return [];
    try {
      return normalize(JSON.parse(raw)).sort(byCreatedAtDesc);
    } catch (err) {
      console.warn('[MiniBlog] 本地数据解析失败，已降级为空列表（原始数据保留未覆盖）。', err);
      return [];
    }
  }

  /** 全量写回本地存储 */
  function savePosts(list) {
    if (!storageReady) {
      showStatus('当前环境不可用本地存储，刷新后数据会丢失');
      return false;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      console.warn('[MiniBlog] 本地数据写入失败。', err);
      showStatus('保存失败，当前内容仅保留在页面中');
      return false;
    }
  }

  /* ---------- 5. 工具函数 ---------- */
  function charLength(text) {
    // 按 Unicode 码点计数，避免表情符号被算成 2 个字符
    return Array.from(text).length;
  }

  function generateId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      try {
        return window.crypto.randomUUID();
      } catch (err) {
        /* 回退到时间戳方案 */
      }
    }
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  /** 相对时间：刚刚 / x 分钟前 / x 小时前 / x 天前 / YYYY-MM-DD */
  function formatRelativeTime(ts) {
    var diff = Date.now() - ts;
    if (diff < 0) diff = 0;
    var minute = 60000;
    var hour = 60 * minute;
    var day = 24 * hour;

    if (diff < minute) return '刚刚';
    if (diff < hour) return Math.floor(diff / minute) + ' 分钟前';
    if (diff < day) return Math.floor(diff / hour) + ' 小时前';
    if (diff < 7 * day) return Math.floor(diff / day) + ' 天前';

    var d = new Date(ts);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function formatAbsoluteTime(ts) {
    var d = new Date(ts);
    return (
      d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes())
    );
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function showStatus(message) {
    if (!els.status) return;
    els.status.textContent = message;
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(function () {
      els.status.textContent = '';
    }, 4000);
  }

  /* ---------- 6. 业务逻辑 ---------- */
  function createPost() {
    var raw = els.input.value;
    var content = raw.trim();
    var len = charLength(raw);

    if (!content) {
      shakePublishButton();
      els.input.focus();
      return;
    }
    if (len > MAX_LEN) {
      shakePublishButton();
      showStatus('内容超出上限，请删减后再发布');
      els.input.focus();
      return;
    }

    var post = {
      id: generateId(),
      content: content,
      createdAt: Date.now(),
      author: DEFAULT_AUTHOR
    };

    posts.unshift(post);
    savePosts(posts);

    els.input.value = '';
    updateComposerState();
    renderList(post.id);
    scrollToFeed();
    els.input.focus();
  }

  function deletePost(id) {
    var card = els.list.querySelector('[data-id="' + id + '"]');
    var commit = function () {
      posts = posts.filter(function (item) {
        return item.id !== id;
      });
      savePosts(posts);
      renderList();
    };

    if (!card || prefersReducedMotion()) {
      commit();
      return;
    }
    card.classList.add('is-removing');
    setTimeout(commit, DELETE_ANIM);
  }

  function requestDelete(id, trigger) {
    if (!window.confirm(CONFIRM_TEXT)) {
      if (trigger) trigger.focus();
      return;
    }
    deletePost(id);
  }

  function shakePublishButton() {
    if (prefersReducedMotion()) return;
    els.publishBtn.classList.remove('is-shake');
    /* 强制回流以便重复触发动画 */
    void els.publishBtn.offsetWidth;
    els.publishBtn.classList.add('is-shake');
  }

  /* ---------- 7. 渲染层 ---------- */
  function updateComposerState() {
    var len = charLength(els.input.value);
    var over = len > MAX_LEN;

    els.counter.textContent = over
      ? '已超出 ' + (len - MAX_LEN) + ' 个字符'
      : '已输入 ' + len + ' / ' + MAX_LEN;

    els.counter.classList.toggle('is-warning', !over && len >= WARN_LEN);
    els.counter.classList.toggle('is-danger', over);
    els.publishBtn.disabled = over || els.input.value.trim().length === 0;
  }

  function autoResize() {
    var input = els.input;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 200) + 'px';
  }

  function buildDeleteButton(post) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mb-icon-btn';
    btn.setAttribute('data-action', 'delete');
    btn.setAttribute('aria-label', '删除这条动态');
    btn.title = '删除这条动态';
    /* 静态图标，不含任何用户输入 */
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M5 7h14M10 7V5.6A1.6 1.6 0 0 1 11.6 4h.8A1.6 1.6 0 0 1 14 5.6V7m-7 0 .8 11.1A1.9 1.9 0 0 0 9.7 20h4.6a1.9 1.9 0 0 0 1.9-1.9L17 7" ' +
      'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<span>删除</span>';
    btn.addEventListener('click', function () {
      requestDelete(post.id, btn);
    });
    return btn;
  }

  function renderPost(post, newId) {
    var li = document.createElement('li');
    li.className = 'mb-post';
    li.setAttribute('data-id', post.id);

    var head = document.createElement('div');
    head.className = 'mb-post__head';

    var avatar = document.createElement('span');
    avatar.className = 'mb-post__avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = '我';

    var meta = document.createElement('div');
    meta.className = 'mb-post__meta';

    var author = document.createElement('span');
    author.className = 'mb-post__author';
    author.textContent = post.author;

    var time = document.createElement('time');
    time.className = 'mb-post__time';
    time.setAttribute('datetime', new Date(post.createdAt).toISOString());
    time.setAttribute('data-ts', String(post.createdAt));
    time.title = formatAbsoluteTime(post.createdAt);
    time.textContent = formatRelativeTime(post.createdAt);

    meta.appendChild(author);
    meta.appendChild(time);
    head.appendChild(avatar);
    head.appendChild(meta);

    var body = document.createElement('p');
    body.className = 'mb-post__body';
    body.textContent = post.content; // 纯文本写入，杜绝 HTML 注入

    var foot = document.createElement('div');
    foot.className = 'mb-post__foot';
    foot.appendChild(buildDeleteButton(post));

    li.appendChild(head);
    li.appendChild(body);
    li.appendChild(foot);

    if (newId && post.id === newId) {
      li.classList.add('is-new');
    } else {
      li.classList.add('is-enter');
    }
    return li;
  }

  function renderList(newId) {
    var fragment = document.createDocumentFragment();
    var visible = posts.slice(0, MAX_RENDER);

    visible.forEach(function (post) {
      fragment.appendChild(renderPost(post, newId));
    });

    els.list.textContent = '';
    els.list.appendChild(fragment);

    var empty = posts.length === 0;
    els.empty.hidden = !empty;
    els.summary.textContent = empty ? '共 0 条' : '共 ' + posts.length + ' 条';

    els.badge.textContent = posts.length + ' 条动态';
    els.badge.hidden = empty;
  }

  function refreshTimeLabels() {
    var nodes = els.list.querySelectorAll('[data-ts]');
    Array.prototype.forEach.call(nodes, function (node) {
      var ts = Number(node.getAttribute('data-ts'));
      if (!isFinite(ts)) return;
      node.textContent = formatRelativeTime(ts);
    });
  }

  function scrollToFeed() {
    if (!els.feed) return;
    els.feed.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  /* ---------- 8. 事件绑定 ---------- */
  function bindEvents() {
    els.input.addEventListener('input', function () {
      updateComposerState();
      autoResize();
    });

    els.input.addEventListener('keydown', function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!els.publishBtn.disabled) createPost();
        else shakePublishButton();
      }
    });

    els.publishBtn.addEventListener('click', createPost);

    window.addEventListener('scroll', function () {
      if (!els.topbar) return;
      els.topbar.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) refreshTimeLabels();
    });
  }

  /* ---------- 9. 初始化 ---------- */
  function init() {
    storageReady = detectStorage();
    posts = loadPosts();
    bindEvents();
    updateComposerState();
    autoResize();
    renderList();

    setInterval(refreshTimeLabels, TIME_TICK);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
