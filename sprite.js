//matematica
const PI2     = Math.PI / 2.0;
const PI3			= Math.PI / 3.0;
const PI4     = Math.PI / 4.0;
const PI6	  = Math.PI / 6.0;
const PI12	  = Math.PI / 12.0;
const RAD4DEG = Math.PI / 180.0;
const DEG4RAD = 180.0 / Math.PI;

//tiros
function Shot(_x, _y, _vx, _vy, r, dir) {
	this.pos = {_x, _y};
	this.vel = {_vx, _vy};
	this.radius = r;
	//desenha os tiros
	this.draw = function(ctx) {
		ctx.fillStyle   = "#000000";
		ctx.strokeStyle = "#ff0000";
		ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, 4, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fill();
	}
	//move os tiros
	this.move = function(dt, g) {
		if(dir == 0){
			this.pos.x += this.vel.vx * dt;
			this.pos.y += this.vel.vy * dt;
		}else if (dir == 1) {
			this.pos.x += this.vel.vx * dt;
			this.pos.y += this.vel.vy * dt;
		}
		//console.log(this.pos);
	}
	//cria o vetor de velocidade do tiro
	this.setVelocityVector = function(o, _mag) {
		if(dir == 0){
			var mag = _mag || 325;
		}if (dir == 1) {
			var mag = _mag || 325;
		}

		var d = this.pos;
		var norm = Math.sqrt( Math.pow(d.x - o.x, 2) + Math.pow(o.y - d.y, 2) );

		this.vel = {vx: (d.x - o.x)/norm, vy: (d.y - o.y)/norm};
		this.vel.vx *= mag;
		this.vel.vy *= mag;
		//console.log(this.vel);
	}
}

//naves
function Shooter(center, size, color, rotacao) {
	this.center = center || {x: 0, y: 0};
	this.size  = size || {w: 50, h: 50};
	this.theta = 0;
	//this.omega = 0;
  this.vx = 0;
  this.vy = 0;
	this.color = " ";
	this.rotacao = rotacao;
	this.pontos = 0;

	this.ballPos = {x: this.center.x, y: this.center.y - this.size.h / 2};
	//desenha a nave
	this.draw = function(ctx) {
		if(!ctx) return;// somente desenha se existe contexto

		ctx.save();
		ctx.translate(this.center.x, this.center.y);
		ctx.rotate(rotacao);
		//cor
		ctx.fillStyle = color;
		ctx.strokeStyle = "#00ff26";
		ctx.beginPath();
			ctx.moveTo(-this.size.w / 2, this.size.h / 2);
			ctx.lineTo(this.size.w / 2,  this.size.h / 2);
			ctx.lineTo(0, -this.size.h / 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		if(true){
	    ctx.strokeStyle = "grey";
	    ctx.strokeRect(-this.size.w/2, -this.size.h/2, this.size.w, this.size.h);
	  }

		ctx.restore();
	}
	//move a nave
	this.move = function(dt) {
		//limite das naves na tela
		//limite lateral //500 tam da tela
		if (this.center.x < this.size.w/2) {
			this.center.x = this.size.w/2;
		}if (this.center.x > 500-this.size.w/2) {
			this.center.x = 500-this.size.w/2;
		}

		if(this.rotacao == 2*Math.PI){
			//limite cima e baixo
			if (this.center.y < this.size.h) {
				this.center.y = this.size.h;
			}if (this.center.y > 500-this.size.h/2) {
				this.center.y = 500-this.size.h/2;
			}

			//posiciona o tiro na ponta da nave e define a direcao
			this.ballPos.x = this.center.x + (this.size.h / 2) * Math.sin(this.theta);
			this.ballPos.y = this.center.y - (this.size.h / 2) * Math.cos(this.theta);
			//move a nave
	    this.center.x += this.vx * dt;
	    this.center.y += this.vy * dt;
		}else {//controle dos bots
			this.ballPos.x = this.center.x + (this.size.h / 2) * Math.sin(this.theta);
			this.ballPos.y = this.center.y - (this.size.h / 2) * Math.cos(this.theta);

			this.center.x += 0 * dt;
	    this.center.y += 200*Math.random() * dt;
		}
	}
  //reset da nave
	this.reset = function() {
		if(rotacao == 2*Math.PI){
			this.life = 3;
			this.pontos = 0;
		}else {
			this.life = 1;
			this.pontos = 0;
		}

	}
}
