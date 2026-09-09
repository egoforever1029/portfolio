/**
 * Логика интерактивности космического сайта
 */

document.addEventListener('DOMContentLoaded', () => {

    // Инкремент счетчика посещений
    const visits = parseInt(localStorage.getItem('visits') || '0');
    localStorage.setItem('visits', (visits + 1).toString());

    // Загрузка кастомных текстов Hero из CMS (localStorage)
    const customHero = localStorage.getItem('cms_hero');
    if (customHero) {
        const heroData = JSON.parse(customHero);
        const heroTitle = document.querySelector('.glitch-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroTitle) {
            heroTitle.textContent = heroData.title;
            heroTitle.setAttribute('data-text', heroData.title);
        }
        if (heroSubtitle) {
            heroSubtitle.textContent = heroData.subtitle;
        }
    }

    // ==========================================
    // 1. Кастомный курсор с эффектом инерции (lerp)
    // ==========================================
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');
    
    let mouseX = 0, mouseY = 0; // Реальные координаты мыши
    let posX = 0, posY = 0;     // Сглаженные координаты кольца
    let dotX = 0, dotY = 0;     // Сглаженные координаты точки

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Функция обновления положения курсора
        const updateCursor = () => {
            // Линейная интерполяция для плавности
            posX += (mouseX - posX) * 0.12;
            posY += (mouseY - posY) * 0.12;
            
            dotX += (mouseX - dotX) * 0.3;
            dotY += (mouseY - dotY) * 0.3;

            if (cursor) {
                cursor.style.left = `${posX}px`;
                cursor.style.top = `${posY}px`;
            }
            if (cursorDot) {
                cursorDot.style.left = `${dotX}px`;
                cursorDot.style.top = `${dotY}px`;
            }

            requestAnimationFrame(updateCursor);
        };
        updateCursor();

        // Добавляем эффект при наведении на кликабельные элементы
        const interactives = document.querySelectorAll('a, button, .planet-tab, select, input, textarea, #sandbox-canvas');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hover-active');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.add('hover-active');
                document.body.classList.remove('hover-active');
            });
        });
    } else {
        // Скрываем кастомные курсоры на тач-устройствах
        if (cursor) cursor.style.display = 'none';
        if (cursorDot) cursorDot.style.display = 'none';
    }


    // ==========================================
    // 2. Интерактивный фоновый холст (Canvas Stars)
    // ==========================================
    const starsCanvas = document.getElementById('stars-canvas');
    const ctxStars = starsCanvas.getContext('2d');

    let stars = [];
    const starsCount = 120;
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    // Ресайз фонового Canvas
    const resizeStarsCanvas = () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        starsCanvas.width = canvasWidth;
        starsCanvas.height = canvasHeight;
        initStars();
    };

    // Класс Звезды
    class Star {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvasWidth;
            this.y = Math.random() * canvasHeight;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.15;
            this.speedY = (Math.random() - 0.5) * 0.15;
            this.alpha = Math.random();
            this.alphaSpeed = Math.random() * 0.01 + 0.002;
            this.alphaDirection = Math.random() > 0.5 ? 1 : -1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Выход за границы
            if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
                this.reset();
            }

            // Мерцание
            this.alpha += this.alphaSpeed * this.alphaDirection;
            if (this.alpha >= 1) {
                this.alpha = 1;
                this.alphaDirection = -1;
            } else if (this.alpha <= 0.1) {
                this.alpha = 0.1;
                this.alphaDirection = 1;
            }
        }

        draw() {
            ctxStars.save();
            ctxStars.globalAlpha = this.alpha;
            ctxStars.beginPath();
            ctxStars.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctxStars.fillStyle = '#ffffff';
            // Сине-голубое свечение некоторым звездам
            if (this.size > 2) {
                ctxStars.shadowColor = '#00f2fe';
                ctxStars.shadowBlur = 8;
            }
            ctxStars.fill();
            ctxStars.restore();
        }
    }

    const initStars = () => {
        stars = [];
        for (let i = 0; i < starsCount; i++) {
            stars.push(new Star());
        }
    };

    // Анимационный цикл звездного неба
    const animateStars = () => {
        ctxStars.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Линии связи между звездами при малом расстоянии
        for (let i = 0; i < stars.length; i++) {
            stars[i].update();
            stars[i].draw();

            for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[i].x - stars[j].x;
                const dy = stars[i].y - stars[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctxStars.save();
                    ctxStars.strokeStyle = 'rgba(0, 242, 254, 0.05)';
                    ctxStars.lineWidth = 0.6;
                    ctxStars.beginPath();
                    ctxStars.moveTo(stars[i].x, stars[i].y);
                    ctxStars.lineTo(stars[j].x, stars[j].y);
                    ctxStars.stroke();
                    ctxStars.restore();
                }
            }
        }
        requestAnimationFrame(animateStars);
    };

    window.addEventListener('resize', resizeStarsCanvas);
    resizeStarsCanvas();
    animateStars();


    // ==========================================
    // 3. Интерактивный каталог планет
    // ==========================================
    const planetData = {
        mars: {
            title: "Марс",
            desc: "Четвертая планета от Солнца, названная в честь древнеримского бога войны. Также известна как Красная планета из-за высокого содержания оксида железа на ее поверхности. Здесь находятся самый высокий вулкан в Солнечной системе — Олимп, и грандиозная долина Маринер.",
            gravity: "3.71 м/с²",
            distance: "227.9 млн км",
            temp: "-63 °C",
            img: "assets/mars.jpg",
            glow: "radial-gradient(circle, rgba(255, 69, 0, 0.3) 0%, transparent 70%)"
        },
        jupiter: {
            title: "Юпитер",
            desc: "Крупнейшая планета Солнечной системы, газовый гигант с массой, более чем в два раза превышающей массу всех остальных планет вместе взятых. Знаменит своим Большим Красным Пятном — гигантским вихрем, бушующим уже несколько веков, и десятками спутников.",
            gravity: "24.79 м/с²",
            distance: "778.5 млн км",
            temp: "-108 °C",
            img: "assets/jupiter.jpg",
            glow: "radial-gradient(circle, rgba(210, 105, 30, 0.35) 0%, transparent 70%)"
        },
        saturn: {
            title: "Сатурн",
            desc: "Второй по величине газовый гигант, знаменитый своей великолепной и сложной системой ледяных и пылевых колец. У Сатурна наименьшая плотность среди всех планет — он мог бы плавать на воде. Имеет развитую спутниковую систему во главе с ледяным Титаном.",
            gravity: "10.44 м/с²",
            distance: "1.43 млрд км",
            temp: "-139 °C",
            img: "assets/saturn.jpg",
            glow: "radial-gradient(circle, rgba(238, 232, 170, 0.3) 0%, transparent 70%)"
        }
    };

    // Загрузка кастомных данных планет из CMS (localStorage)
    const customPlanets = localStorage.getItem('cms_planets');
    if (customPlanets) {
        const planetsObj = JSON.parse(customPlanets);
        Object.keys(planetsObj).forEach(key => {
            if (planetData[key]) {
                planetData[key].desc = planetsObj[key].desc;
                planetData[key].gravity = planetsObj[key].gravity;
                planetData[key].distance = planetsObj[key].distance;
                planetData[key].temp = planetsObj[key].temp;
            }
        });
    }

    const tabs = document.querySelectorAll('.planet-tab');
    const planetImg = document.getElementById('planet-img');
    const planetGlow = document.querySelector('.planet-glow');
    const planetTitle = document.getElementById('planet-title');
    const planetDesc = document.getElementById('planet-desc');
    const planetGravity = document.getElementById('planet-gravity');
    const planetDistance = document.getElementById('planet-distance');
    const planetTemp = document.getElementById('planet-temp');

    // Инициализация стартовых данных для активной планеты
    const initActivePlanet = () => {
        const activeTab = document.querySelector('.planet-tab.active');
        if (activeTab) {
            const key = activeTab.getAttribute('data-planet');
            const data = planetData[key];
            if (data) {
                planetImg.src = data.img;
                planetImg.alt = data.title;
                planetTitle.textContent = data.title;
                planetDesc.textContent = data.desc;
                planetGravity.textContent = data.gravity;
                planetDistance.textContent = data.distance;
                planetTemp.textContent = data.temp;
                planetGlow.style.background = data.glow;
            }
        }
    };
    initActivePlanet();

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const planetKey = tab.getAttribute('data-planet');
            const data = planetData[planetKey];

            if (!data) return;

            // Смена активного класса вкладки
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Анимация затухания и смены инфо
            planetImg.classList.remove('active');
            
            setTimeout(() => {
                planetImg.src = data.img;
                planetImg.alt = data.title;
                planetTitle.textContent = data.title;
                planetDesc.textContent = data.desc;
                planetGravity.textContent = data.gravity;
                planetDistance.textContent = data.distance;
                planetTemp.textContent = data.temp;
                planetGlow.style.background = data.glow;
                
                planetImg.classList.add('active');
            }, 300);
        });
    });


    // ==========================================
    // 4. Симулятор Черной Дыры (Gravity Sandbox)
    // ==========================================
    const sandboxCanvas = document.getElementById('sandbox-canvas');
    const ctxSandbox = sandboxCanvas.getContext('2d');
    const btnReset = document.getElementById('btn-reset-particles');
    const particleCountEl = document.getElementById('particle-count');

    let sandboxWidth = 0;
    let sandboxHeight = 0;
    let sandboxParticles = [];
    let blackHoles = [];
    const maxParticles = 160;

    // Ресайз песочницы
    const resizeSandbox = () => {
        if (!sandboxCanvas) return;
        const rect = sandboxCanvas.parentElement.getBoundingClientRect();
        sandboxWidth = rect.width;
        sandboxHeight = rect.height;
        sandboxCanvas.width = sandboxWidth;
        sandboxCanvas.height = sandboxHeight;
        initSandboxParticles();
    };

    // Класс частицы для симуляции
    class SandboxParticle {
        constructor() {
            this.reset();
        }

        reset() {
            // Спавним на случайной орбите или по краям
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * (Math.min(sandboxWidth, sandboxHeight) / 2) + 50;
            this.x = sandboxWidth / 2 + Math.cos(angle) * dist;
            this.y = sandboxHeight / 2 + Math.sin(angle) * dist;
            
            // Задаем начальную касательную скорость (для орбитального движения)
            const speed = Math.random() * 1.5 + 0.8;
            this.vx = -Math.sin(angle) * speed;
            this.vy = Math.cos(angle) * speed;
            
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.5 ? '#00f2fe' : '#b92b27'; // Неоновые голубые или пурпурные частицы
            this.alpha = Math.random() * 0.5 + 0.5;
        }

        update() {
            // Применяем гравитационное влияние каждой черной дыры
            blackHoles.forEach(bh => {
                const dx = bh.x - this.x;
                const dy = bh.y - this.y;
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq);

                if (dist < bh.radius) {
                    // Частица поглощена черной дырой
                    this.reset();
                } else {
                    // Закон всемирного тяготения F = G * M / r^2
                    // Добавим константу смягчения (1000) во избежание деления на ноль при малых дистанциях
                    const force = (bh.mass) / (distSq + 600);
                    this.vx += (dx / dist) * force;
                    this.vy += (dy / dist) * force;
                }
            });

            // Ограничение максимальной скорости
            const maxSpeed = 10;
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed > maxSpeed) {
                this.vx = (this.vx / currentSpeed) * maxSpeed;
                this.vy = (this.vy / currentSpeed) * maxSpeed;
            }

            this.x += this.vx;
            this.y += this.vy;

            // Выход за границы экрана — перезапускаем
            if (this.x < -50 || this.x > sandboxWidth + 50 || this.y < -50 || this.y > sandboxHeight + 50) {
                this.reset();
            }
        }

        draw() {
            ctxSandbox.save();
            ctxSandbox.globalAlpha = this.alpha;
            ctxSandbox.fillStyle = this.color;
            ctxSandbox.beginPath();
            ctxSandbox.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctxSandbox.fill();
            ctxSandbox.restore();
        }
    }

    // Класс Черной Дыры
    class BlackHole {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.mass = 400; // Сила притяжения
            this.radius = 18; // Горизонт событий
            this.pulse = 0;
        }

        update() {
            this.pulse += 0.05;
        }

        draw() {
            ctxSandbox.save();
            
            // Внешнее свечение
            const glowRadius = this.radius * (2 + Math.sin(this.pulse) * 0.2);
            const gradient = ctxSandbox.createRadialGradient(
                this.x, this.y, this.radius * 0.4, 
                this.x, this.y, glowRadius
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.3, 'rgba(185, 43, 39, 0.4)');
            gradient.addColorStop(0.6, 'rgba(160, 32, 240, 0.15)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctxSandbox.fillStyle = gradient;
            ctxSandbox.beginPath();
            ctxSandbox.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
            ctxSandbox.fill();

            // Ядро (Сингулярность)
            ctxSandbox.fillStyle = '#000000';
            ctxSandbox.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctxSandbox.lineWidth = 1;
            ctxSandbox.beginPath();
            ctxSandbox.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
            ctxSandbox.fill();
            ctxSandbox.stroke();

            ctxSandbox.restore();
        }
    }

    const initSandboxParticles = () => {
        sandboxParticles = [];
        for (let i = 0; i < maxParticles; i++) {
            sandboxParticles.push(new SandboxParticle());
        }
        if (particleCountEl) {
            particleCountEl.textContent = `Частицы: ${sandboxParticles.length}`;
        }
    };

    // Главный цикл симуляции
    const animateSandbox = () => {
        if (!sandboxCanvas) return;
        
        ctxSandbox.fillStyle = 'rgba(1, 1, 6, 0.2)'; // Эффект хвоста (motion blur)
        ctxSandbox.fillRect(0, 0, sandboxWidth, sandboxHeight);

        // Обновление и отрисовка черных дыр
        blackHoles.forEach(bh => {
            bh.update();
            bh.draw();
        });

        // Обновление и отрисовка частиц
        sandboxParticles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animateSandbox);
    };

    // Спавн черной дыры по клику
    if (sandboxCanvas) {
        sandboxCanvas.addEventListener('click', (e) => {
            // Убираем хинт при первом клике
            const hint = document.querySelector('.canvas-hint');
            if (hint) {
                hint.style.opacity = 0;
            }

            const rect = sandboxCanvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // Ограничение — не более 5 черных дыр одновременно
            if (blackHoles.length >= 5) {
                blackHoles.shift(); // Удаляем самую старую
            }
            
            blackHoles.push(new BlackHole(clickX, clickY));
        });
    }

    // Сброс симулятора
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            blackHoles = [];
            initSandboxParticles();
            const hint = document.querySelector('.canvas-hint');
            if (hint) {
                hint.style.opacity = 1;
            }
        });
    }

    resizeSandbox();
    animateSandbox();
    window.addEventListener('resize', resizeSandbox);


    // ==========================================
    // 5. Scroll Reveal и отслеживание активного пункта меню
    // ==========================================
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Настройка Intersection Observer для вылетающих блоков
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        root: null,
        threshold: 0.12
    });

    sections.forEach(section => {
        revealObserver.observe(section);
    });

    // Настройка Intersection Observer для активного меню
    const activeSectionCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    };

    const activeObserver = new IntersectionObserver(activeSectionCallback, {
        root: null,
        threshold: 0.5
    });

    sections.forEach(section => {
        activeObserver.observe(section);
    });


    // ==========================================
    // 6. Мобильное меню (Burger)
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Закрываем меню при клике по ссылке
        const menuLinks = document.querySelectorAll('.nav-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }


    // ==========================================
    // 7. Скролл-шапка
    // ==========================================
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // ==========================================
    // 8. Обработка формы Центра Управления
    // ==========================================
    const missionForm = document.getElementById('mission-form');
    if (missionForm) {
        missionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const callsign = document.getElementById('callsign').value;
            const email = document.getElementById('email').value;
            const sector = document.getElementById('sector').value;
            const message = document.getElementById('message').value;

            // Сохранение в localStorage для админ-панели
            const transmissions = JSON.parse(localStorage.getItem('transmissions') || '[]');
            transmissions.push({
                callsign,
                email,
                sector,
                message,
                timestamp: Date.now()
            });
            localStorage.setItem('transmissions', JSON.stringify(transmissions));

            // Анимационный Алерт в космическом стиле
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'rgba(1,1,5,0.92)';
            overlay.style.zIndex = '10000';
            overlay.style.display = 'flex';
            overlay.style.flexDirection = 'column';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s ease';

            overlay.innerHTML = `
                <div class="glass-card" style="padding: 40px; text-align: center; max-width: 500px; border-color: #00f2fe; box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);">
                    <i class="fa-solid fa-satellite" style="font-size: 3rem; color: #00f2fe; margin-bottom: 20px; animation: pulse 1.5s infinite alternate;"></i>
                    <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.6rem; color: #fff; margin-bottom: 15px;">СИГНАЛ ОТПРАВЛЕН</h3>
                    <p style="color: #a0aec0; font-size: 0.95rem; line-height: 1.6; margin-bottom: 25px;">
                        Рапорт позывного <strong>${callsign}</strong> закодирован и успешно передан через ретрансляторы в сектор <strong>${sector.toUpperCase()}</strong>.
                    </p>
                    <button id="close-modal" class="btn btn-primary btn-small">Закрыть канал связи</button>
                </div>
            `;

            document.body.appendChild(overlay);
            
            // Плавное появление
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 50);

            // Кнопка закрытия
            const closeBtn = overlay.querySelector('#close-modal');
            closeBtn.addEventListener('click', () => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 500);
            });

            missionForm.reset();
            console.log(`[MISSION CONTROL LOG] Transmission received from ${callsign} (${email}). Sector: ${sector}. Message: ${message}`);
        });
    }

});
