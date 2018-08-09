//matematica
const PI2     = Math.PI / 2.0;
const PI3			= Math.PI / 3.0;
const PI4     = Math.PI / 4.0;
const PI6	  = Math.PI / 6.0;
const PI12	  = Math.PI / 12.0;
const RAD4DEG = Math.PI / 180.0;
const DEG4RAD = 180.0 / Math.PI;

//Posicao barra
function Point(x, y) {
	this.x = x;
	this.y = y;
}
//Tamanho barra
function Size(w, h) {
	this.w = w;
	this.h = h;
}
//tiros dos bots
function ShotBot(pos, r) {
	this.pos = pos;
	this.radius = r;
	//desenha os tiros
	this.draw = function(ctx) {
		ctx.fillStyle   = "#f6ff00";
		ctx.strokeStyle = "#ff00bb";
		ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, 4, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();
	}
	this.isForaTela = function(){
		if(this.pos.y < 0 || this.pos.x < 0 || this.pos.x > 500 || this.pos.y > 500){
			return true;
		}
		return false;
	}
	//move os tiros
	this.movexDown = function(dt){
		if (!(this.isForaTela())) {
			this.pos.y += 300 * dt;
		}
	}
}
//tiros do player
function Shot(_x, _y, _vx, _vy, r, dir) {
	this.pos = {_x, _y};
	this.vel = {_vx, _vy};
	this.radius = r;
	//desenha os tiros
	this.draw = function(ctx) {
		ctx.fillStyle   = "#f6ff00";
		ctx.strokeStyle = "#ff00bb";
		ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, 4, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();
	}
	//Verifica se o tiro saiu da tela
	this.isForaTela = function(){
		if(this.pos.y < 0 || this.pos.x < 0 || this.pos.x > 500 || this.pos.y > 500){
			return true;
		}
		return false;
	}
	//move os tiros
	this.movexUp = function(dt){
		if (!(this.isForaTela())) {
			this.pos.y -= 300 * dt;
		}
	}
}

//naves
function Shooter(center, size, color, rotacao, image) {
	this.center = center || {x: 0, y: 0};
	this.size  = size || {w: 50, h: 50};
	this.theta = 0;
  this.vx = 0;
  this.vy = 0;
	this.color = " ";
	this.rotacao = rotacao;
	this.pontos = 0;
	this.cadenciaTiro = 0;
	this.sprite = image;
	//mostra a localizacao da nave ao tiro
	this.ballPos = {x: this.center.x, y: this.center.y - this.size.h / 2};
	//desenha a nave
	this.draw = function(ctx) {
		if(!ctx) return;// somente desenha se existe contexto

		ctx.save();
		//reposiciona a origem (0,0) no contexto
		ctx.translate(this.center.x, this.center.y);
		ctx.rotate(rotacao);//rotaciona o sprite
		ctx.fillStyle = color;//cor
		//mostra o triangulo base do sprite
		/*ctx.strokeStyle = "#00ff26";
		ctx.beginPath();
			ctx.moveTo(-this.size.w / 2, this.size.h / 2);
			ctx.lineTo(this.size.w / 2,  this.size.h / 2);
			ctx.lineTo(0, -this.size.h / 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();*/
		//mostra as caixas de colisao das naves
	  ctx.strokeStyle = "grey";
	  ctx.strokeRect(-this.size.w/2, -this.size.h/2, this.size.w, this.size.h);

		ctx.drawImage(this.sprite, -this.size.w/2, -this.size.h/2, this.size.w, this.size.h);

		ctx.restore();
	}
	//verifica se o player saiu da tela
	this.isForaTela = function() {
		//limite da lateral //500 tam da tela
		if (this.center.x < this.size.w/2) {
			this.center.x = this.size.w/2;
			return true;
		}if (this.center.x > 500-this.size.w/2) {
			this.center.x = 500-this.size.w/2;
			return true;
		}//limite de cima de baixo
		if (this.center.y < this.size.h/2) {
			this.center.y = this.size.h/2;
			return true;
		}if (this.center.y > 500-this.size.h/2) {
			this.center.y = 500-this.size.h/2;
			return true;
		}
		return false;
	}

	//verifica se bot saiu da tela
	this.isForaTelaBot = function() {
		/*if (this.center.x < this.size.w/2) {
			this.center.x = this.size.w/2;
			return true;
		}if (this.center.x > 500-this.size.w/2) {
			this.center.x = 500-this.size.w/2;
			return true;
		}*///limite de baixo
		if (this.center.y > 500-this.size.h/2) {
			this.center.y = 500-this.size.h/2;
			return true;
		}
		return false;
	}

	//move os bots
	this.moveBot = function(dt, id) {
		//mostra a localizacao do inimigo para o tiro
		this.ballPos.x = this.center.x + (this.size.h / 2) * Math.sin(this.theta);
		this.ballPos.y = this.center.y - (this.size.h / 2) * Math.cos(this.theta);
		//controle da cadencia
		this.cadenciaTiro += 1 * dt;
		//acelera os bots que acabaram de entrar no jogo
		if(this.center.y < 100){
			this.center.x += 0;
			this.center.y += 5*10*Math.random() * dt;
		}
		//ajusta o movimento dos bots
		if(id == 1){
			this.center.x += 5*10*Math.random() * dt;
			this.center.y += 5*10*Math.random() * dt;
		}if(id == 2){
			this.center.x -= 5*10*Math.random() * dt;
			this.center.y += 5*10*Math.random() * dt;
		}if(id == 5) {
			this.center.x += 0*Math.random() * dt;
			this.center.y += 5*10*Math.random() * dt;
		}
	}
	//move a nave
	this.move = function(dt) {
		if(!(this.isForaTela())){
			//posiciona o tiro na ponta da nave e define a direcao
			this.ballPos.x = this.center.x;
			this.ballPos.y = this.center.y - (this.size.h / 2);
			//move a nave
	    this.center.x += this.vx * dt;
	    this.center.y += this.vy * dt;
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
