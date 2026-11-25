(() => {
  'use strict';

  const raiz = document.documentElement;
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== Tema claro / escuro ===== */
  document.getElementById('btn-tema').addEventListener('click', () => {
    const novo = raiz.dataset.tema === 'escuro' ? 'claro' : 'escuro';
    raiz.dataset.tema = novo;
    try { localStorage.setItem('tema', novo); } catch (e) {}
  });

  /* ===== Imprimir / salvar em PDF ===== */
  document.getElementById('btn-imprimir').addEventListener('click', () => window.print());

  /* ===== Menu no celular ===== */
  const menu = document.getElementById('menu');
  const btnMenu = document.getElementById('btn-menu');

  const abrirMenu = (aberto) => {
    menu.classList.toggle('aberto', aberto);
    btnMenu.setAttribute('aria-expanded', String(aberto));
    btnMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  };

  btnMenu.addEventListener('click', () => abrirMenu(!menu.classList.contains('aberto')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) abrirMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') abrirMenu(false); });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btnMenu.contains(e.target)) abrirMenu(false);
  });

  /* ===== Efeitos ligados à rolagem ===== */
  const topo = document.querySelector('.topo');
  const barra = document.querySelector('.progresso');
  const voltar = document.querySelector('.voltar-topo');
  const secoes = [...document.querySelectorAll('main section')];
  const links = [...menu.querySelectorAll('a')];

  const aoRolar = () => {
    const y = window.scrollY;
    const total = raiz.scrollHeight - window.innerHeight;

    barra.style.transform = `scaleX(${total > 0 ? Math.min(y / total, 1) : 0})`;
    topo.classList.toggle('rolou', y > 10);
    voltar.classList.toggle('visivel', y > 500);

    // Marca no menu a seção que está na tela
    let atual = secoes[0];
    secoes.forEach((s) => {
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.4) atual = s;
    });
    if (total > 0 && y >= total - 2) atual = secoes[secoes.length - 1];

    links.forEach((a) => a.classList.toggle('ativo', a.hash === `#${atual.id}`));
  };

  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar);
  aoRolar();

  /* ===== Elementos aparecem ao entrar na tela ===== */
  const elementos = document.querySelectorAll('.revelar');

  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.filter((e) => e.isIntersecting).forEach((entrada, i) => {
        const el = entrada.target;
        el.style.transitionDelay = `${i * 120}ms`;
        el.classList.add('visivel');
        // Depois de aparecer, remove o atraso para o efeito de hover ficar imediato
        setTimeout(() => { el.style.transitionDelay = ''; }, 800 + i * 120);
        observador.unobserve(el);
      });
    }, { threshold: 0.12 });

    elementos.forEach((el) => observador.observe(el));
  } else {
    elementos.forEach((el) => el.classList.add('visivel'));
  }

  /* ===== Efeito de digitação ===== */
  const alvo = document.getElementById('digitando');
  const frases = alvo.dataset.frases.split('|').map((f) => f.trim()).filter(Boolean);

  if (!semMovimento && frases.length) {
    let frase = 0;
    let letras = 0;
    let apagando = false;

    const digitar = () => {
      const texto = frases[frase];
      letras += apagando ? -1 : 1;
      alvo.textContent = texto.slice(0, letras);

      let espera = apagando ? 40 : 90;

      if (!apagando && letras === texto.length) {
        apagando = true;
        espera = 1800;
      } else if (apagando && letras === 0) {
        apagando = false;
        frase = (frase + 1) % frases.length;
        espera = 350;
      }
      setTimeout(digitar, espera);
    };

    alvo.textContent = '';
    digitar();

    // No PDF saem todas as frases completas, e não uma pela metade
    let textoNaTela = '';
    window.addEventListener('beforeprint', () => {
      textoNaTela = alvo.textContent;
      alvo.textContent = frases.join(' · ');
    });
    window.addEventListener('afterprint', () => { alvo.textContent = textoNaTela; });
  }

  /* ===== Brilho que segue o mouse nos cartões ===== */
  document.querySelectorAll('.cartao').forEach((cartao) => {
    cartao.addEventListener('pointermove', (e) => {
      const r = cartao.getBoundingClientRect();
      cartao.style.setProperty('--x', `${e.clientX - r.left}px`);
      cartao.style.setProperty('--y', `${e.clientY - r.top}px`);
    });
  });

  /* ===== Ano atual no rodapé ===== */
  document.getElementById('ano').textContent = new Date().getFullYear();
})();
