'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Particle = function () {
  function Particle(element) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Particle);

    this.draw = function () {
      if (!_this.props.canvasSupport) {
        return;
      }

      _this.props.winW = window.innerWidth;
      _this.props.winH = window.innerHeight;

      // Wipe canvas
      _this.props.ctx.clearRect(0, 0, _this.props.canvas.width, _this.props.canvas.height);

      // Update particle positions
      for (var i = 0; i < _this.props.particles.length; i++) {
        _this.props.particles[i].updatePosition();
      }
      // Draw particles
      for (var _i = 0; _i < _this.props.particles.length; _i++) {
        _this.props.particles[_i].draw();
      }

      // Call this function next time screen is redrawn
      if (!_this.props.paused) {
        _this.props.raf = requestAnimationFrame(_this.draw);
      }
    };

    this.props = {
      canvasSupport: !!document.createElement('canvas').getContext,
      particles: [],
      mouseX: 0,
      mouseY: 0,
      desktop: !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i),
      orientationSupport: !!window.DeviceOrientationEvent,
      tiltX: 0,
      tiltY: 0,
      pixelRatio: window.devicePixelRatio || 1,
      paused: false,
      element: element
    };
    this.options = {
      minSpeedX: options.minSpeedX || 0.1,
      maxSpeedX: options.maxSpeedX || 0.7,
      minSpeedY: options.minSpeedY || 0.1,
      maxSpeedY: options.maxSpeedY || 0.7,
      directionX: options.directionX || 'center', // 'center', 'left' or 'right'. 'center' = dots bounce off edges
      directionY: options.directionY || 'center', // 'center', 'up' or 'down'. 'center' = dots bounce off edges
      density: options.density || 10000, // How many particles will be generated: one particle every n pixels
      dotColor: options.dotColor || '#666666',
      lineColor: options.lineColor || '#666666',
      particleRadius: options.particleRadius || 7, // Dot size
      lineWidth: options.lineWidth || 1,
      curvedLines: options.curvedLines || false,
      proximity: options.proximity || 100, // How close two dots need to be before they join
      parallax: options.parallax || true,
      parallaxMultiplier: options.parallaxMultiplier || 5, // The lower the number, the more extreme the parallax effect
      onInit: options.onInit || undefined,
      onDestroy: options.onDestroy || undefined
    };
    if (!this.props.canvasSupport) {
      return;
    }

    //Create canvas
    this.props.canvas = document.createElement('canvas');
    this.props.canvas.className = 'pg-canvas';
    this.props.canvas.style.width = '100%';
    this.props.canvas.style.height = '100%';
    this.props.canvas.style.top = 0;
    this.props.canvas.style.left = 0;
    this.props.canvas.style.display = 'block';
    this.props.element.style.position = 'relative';
    this.props.element.insertBefore(this.props.canvas, this.props.element.firstChild);
    this.props.ctx = this.props.canvas.getContext('2d');
    this.styleCanvas();

    // Create particles
    var numParticles = Math.round(this.props.canvas.width * this.props.canvas.height / this.options.density / Math.pow(this.props.pixelRatio, 2));
    for (var i = 0; i < numParticles; i++) {
      var p = new ParticleItem(this.props, this.options);
      p.setStackPos(i);
      this.props.particles.push(p);
    }

    window.addEventListener('resize', function () {
      _this.resizeHandler();
    }, false);

    document.addEventListener('mousemove', function (e) {
      _this.props.mouseX = e.pageX;
      _this.props.mouseY = e.pageY;
    }, false);

    if (this.props.orientationSupport && !this.props.desktop) {
      window.addEventListener('deviceorientation', function () {
        // Contrain tilt range to [-30,30]
        _this.props.tiltY = Math.min(Math.max(-event.beta, -30), 30);
        _this.props.tiltX = Math.min(Math.max(-event.gamma, -30), 30);
      }, true);
    }

    this.draw();
    this.hook('onInit');
  }

  /**
   * Style the canvas
   */


  _createClass(Particle, [{
    key: 'styleCanvas',
    value: function styleCanvas() {
      this.props.canvas.width = this.props.element.offsetWidth * this.props.pixelRatio;
      this.props.canvas.height = this.props.element.offsetHeight * this.props.pixelRatio;
      this.props.ctx.fillStyle = this.options.dotColor;
      this.props.ctx.strokeStyle = this.options.lineColor;
      this.props.ctx.lineWidth = this.options.lineWidth * this.props.pixelRatio;
    }
    /**
     * Draw particles
     */

  }, {
    key: 'resizeHandler',

    /**
     * Add/remove particles.
     */
    value: function resizeHandler() {
      // Resize the canvas
      this.styleCanvas();

      var elWidth = this.props.element.offsetWidth * this.props.pixelRatio;
      var elHeight = this.props.element.offsetHeight * this.props.pixelRatio;

      // Remove particles that are outside the canvas
      for (var i = this.props.particles.length - 1; i >= 0; i--) {
        if (this.props.particles[i].position.x > elWidth || this.props.particles[i].position.y > elHeight) {
          this.props.particles.splice(i, 1);
        }
      }

      // Adjust particle density
      var numParticles = Math.round(this.props.canvas.width * this.props.canvas.height / this.options.density / Math.pow(this.props.pixelRatio, 2));
      if (numParticles > this.props.particles.length) {
        while (numParticles > this.props.particles.length) {
          var p = new ParticleItem(this.props, this.options);
          this.props.particles.push(p);
        }
      } else if (numParticles < this.props.particles.length) {
        this.props.particles.splice(numParticles);
      }

      // Re-index particles
      for (var _i2 = this.props.particles.length - 1; _i2 >= 0; _i2--) {
        this.props.particles[_i2].setStackPos(_i2);
      }
    }

    /**
     * Pause particle system
     */

  }, {
    key: 'pause',
    value: function pause() {
      this.props.paused = true;
    }

    /**
     * Start particle system
     */

  }, {
    key: 'start',
    value: function start() {
      this.props.paused = false;
      this.draw();
    }
  }, {
    key: 'option',
    value: function option(key, val) {
      if (val) {
        this.options[key] = val;
      } else {
        return this.options[key];
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      // console.log('destroy');
      this.props.canvas.parentNode.removeChild(this.props.canvas);
      this.hook('onDestroy');
    }
  }, {
    key: 'hook',
    value: function hook(hookName) {
      if (this.options[hookName] !== undefined) {
        this.options[hookName].call(this.props.element);
      }
    }
    // return {
    //   option: option,
    //   destroy: destroy,
    //   start: start,
    //   pause: pause
    // };

  }]);

  return Particle;
}();

var ParticleItem = function () {
  function ParticleItem(props, options) {
    _classCallCheck(this, ParticleItem);

    this.props = props;
    this.options = options;
    this.stackPos;
    this.active = true;
    this.layer = Math.ceil(Math.random() * 3);
    this.parallaxOffsetX = 0;
    this.parallaxOffsetY = 0;
    // Initial particle position
    this.position = {
      x: Math.ceil(Math.random() * this.props.canvas.width),
      y: Math.ceil(Math.random() * this.props.canvas.height)
    };
    // Random particle speed, within min and max values
    this.speed = {};
    switch (this.options.directionX) {
      case 'left':
        this.speed.x = +(-this.options.maxSpeedX + Math.random() * this.options.maxSpeedX - this.options.minSpeedX).toFixed(2);
        break;
      case 'right':
        this.speed.x = +(Math.random() * this.options.maxSpeedX + this.options.minSpeedX).toFixed(2);
        break;
      default:
        this.speed.x = +(-this.options.maxSpeedX / 2 + Math.random() * this.options.maxSpeedX).toFixed(2);
        this.speed.x += this.speed.x > 0 ? this.options.minSpeedX : -this.options.minSpeedX;
        break;
    }
    switch (this.options.directionY) {
      case 'up':
        this.speed.y = +(-this.options.maxSpeedY + Math.random() * this.options.maxSpeedY - this.options.minSpeedY).toFixed(2);
        break;
      case 'down':
        this.speed.y = +(Math.random() * this.options.maxSpeedY + this.options.minSpeedY).toFixed(2);
        break;
      default:
        this.speed.y = +(-this.options.maxSpeedY / 2 + Math.random() * this.options.maxSpeedY).toFixed(2);
        this.speed.x += this.speed.y > 0 ? this.options.minSpeedY : -this.options.minSpeedY;
        break;
    }
  }
  /**
   * Draw particle
   */


  _createClass(ParticleItem, [{
    key: 'draw',
    value: function draw() {
      // Draw circle
      this.props.ctx.beginPath();
      this.props.ctx.arc(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY, this.options.particleRadius * this.props.pixelRatio / 2, 0, Math.PI * 2, true);
      this.props.ctx.closePath();
      this.props.ctx.fill();

      // Draw lines
      this.props.ctx.beginPath();
      // Iterate over all particles which are higher in the stack than this one
      for (var i = this.props.particles.length - 1; i > this.stackPos; i--) {
        var p2 = this.props.particles[i];

        // Pythagorus theorum to get distance between two points
        var a = this.position.x - p2.position.x;
        var b = this.position.y - p2.position.y;
        var dist = Math.sqrt(a * a + b * b).toFixed(2);

        // If the two particles are in proximity, join them
        if (dist < this.options.proximity * this.props.pixelRatio) {
          this.props.ctx.moveTo(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY);
          if (this.options.curvedLines) {
            this.props.ctx.quadraticCurveTo(Math.max(p2.position.x, p2.position.x), Math.min(p2.position.y, p2.position.y), p2.position.x + p2.parallaxOffsetX, p2.position.y + p2.parallaxOffsetY);
          } else {
            this.props.ctx.lineTo(p2.position.x + p2.parallaxOffsetX, p2.position.y + p2.parallaxOffsetY);
          }
        }
      }
      this.props.ctx.stroke();
      this.props.ctx.closePath();
    }

    /**
     * update particle position
     */

  }, {
    key: 'updatePosition',
    value: function updatePosition() {
      if (this.options.parallax) {
        if (this.props.orientationSupport && !this.props.desktop) {
          // Map tiltX range [-30,30] to range [0,winW]
          var ratioX = (this.props.winW - 0) / (30 - -30);
          this.props.pointerX = (this.props.tiltX - -30) * ratioX + 0;
          // Map tiltY range [-30,30] to range [0,winH]
          var ratioY = (this.props.winH - 0) / (30 - -30);
          this.props.pointerY = (this.props.tiltY - -30) * ratioY + 0;
        } else {
          this.props.pointerX = this.props.mouseX;
          this.props.pointerY = this.props.mouseY;
        }
        // Calculate parallax offsets
        this.parallaxTargX = (this.props.pointerX - this.props.winW / 2) / (this.options.parallaxMultiplier * this.layer);
        this.parallaxOffsetX += (this.parallaxTargX - this.parallaxOffsetX) / 10; // Easing equation
        this.parallaxTargY = (this.props.pointerY - this.props.winH / 2) / (this.options.parallaxMultiplier * this.layer);
        this.parallaxOffsetY += (this.parallaxTargY - this.parallaxOffsetY) / 10; // Easing equation
      }

      var elWidth = this.props.element.offsetWidth * this.props.pixelRatio;
      var elHeight = this.props.element.offsetHeight * this.props.pixelRatio;

      switch (this.options.directionX) {
        case 'left':
          if (this.position.x + this.speed.x + this.parallaxOffsetX < 0) {
            this.position.x = elWidth - this.parallaxOffsetX;
          }
          break;
        case 'right':
          if (this.position.x + this.speed.x + this.parallaxOffsetX > elWidth) {
            this.position.x = 0 - this.parallaxOffsetX;
          }
          break;
        default:
          // If particle has reached edge of canvas, reverse its direction
          if (this.position.x + this.speed.x + this.parallaxOffsetX > elWidth || this.position.x + this.speed.x + this.parallaxOffsetX < 0) {
            this.speed.x = -this.speed.x;
          }
          break;
      }

      switch (this.options.directionY) {
        case 'up':
          if (this.position.y + this.speed.y + this.parallaxOffsetY < 0) {
            this.position.y = elHeight - this.parallaxOffsetY;
          }
          break;
        case 'down':
          if (this.position.y + this.speed.y + this.parallaxOffsetY > elHeight) {
            this.position.y = 0 - this.parallaxOffsetY;
          }
          break;
        default:
          // If particle has reached edge of canvas, reverse its direction
          if (this.position.y + this.speed.y + this.parallaxOffsetY > elHeight || this.position.y + this.speed.y + this.parallaxOffsetY < 0) {
            this.speed.y = -this.speed.y;
          }
          break;
      }

      // Move particle
      this.position.x += this.speed.x;
      this.position.y += this.speed.y;
    }

    /**
     * Setter: particle stacking position
     */

  }, {
    key: 'setStackPos',
    value: function setStackPos(i) {
      this.stackPos = i;
    }
  }]);

  return ParticleItem;
}();

exports.default = Particle;