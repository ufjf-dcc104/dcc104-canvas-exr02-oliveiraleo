//Texto do placar
function Text(font, size, rgb) {
	this.font = font 	|| "Courier";
	this.size = size 	|| 20;
	this.color = rgb 	|| "#000000" ;

	this.raster = function(ctx, text, x, y) {
		ctx.font = "" + this.size + "px " + this.font;
		ctx.fillStyle = this.color;
		ctx.fillText(text, x, y);// escreve na tela
	}
}
//variaveis globais
var pause = false;
var inicio = false;

var texto = new Text();
var texto2 = new Text("Courier", 20, "red");

var ganhador = 0;

//sons
var musica = new Audio("sound/war.m4a");

var tiro1 = new Audio();
tiro1.src = "sound/tiro.mp3";
var tiro2 = new Audio();
tiro2.src = "sound/tiro_forte.mp3";

var atira1 = function(){
	tiro1.volume = 1.0;
	tiro1.load();
	tiro1.play();
}

var atira2 = function(){
	tiro2.volume = 0.2;
	tiro2.load();
	tiro2.play();
}

//Regra do jogo
function start() {
	var canvas = document.getElementById("game");
	var ctx = canvas.getContext("2d");// cria o contexto
	// define as constantes
	const WIDTH = canvas.offsetWidth;
	const HEIGHT = canvas.offsetHeight;

	const FPS = 60;
	const DT = 1/FPS;
	const G = -20;

	const PTSMAX = 2; // pontuacao que encerra o jogo
	//toca a musica de fundo em loop
	musica.volume = 0;
	musica.play();
	musica.addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
	});
	//variaveis globais
	var shots = []; var shoot = false;
	var shots2 = []; var shoot2 = false;

	var shooter1 = new Shooter({x: WIDTH/2, y: HEIGHT/6}, {w: 20, h: 35}, "black", 2*Math.PI);
  //var shooter2 = new Shooter({x: WIDTH/2, y: 0}, {w: 20, h: 35}, "yellow", Math.PI);
	var ball = new Shot(shooter1.ballPos.x, (shooter1.ballPos.y-shooter1.h), 0, 325, 12, 1);
  //var ball2 = new Shot(shooter2.ballPos.x, shooter2.ballPos.y, 0, -325, 12, 1);

	var bots = [];//inimigos

	var cadenciaBots = 0;

	function criaBot(){
		cadenciaBots = cadenciaBots + 1 * DT;
		if(cadenciaBots > 3){//tempo para criar um novo sprite
			cadenciaBots = 0;
			bots.push(new Shooter({x: Math.random()*WIDTH, y: 0}, {w: 20, h: 35}, "yellow", Math.PI));
			console.log(bots.length);
		}
	}

	function moverBot(){
		for (var i = 0; i < bots.length; i++) {
			bots[i].move(DT);
			bots[i].draw(ctx);
		}
	}

	var bar = { pos: new Point(75, 7), size: new Size(410, 15), energy: 1.0 };

	var recomeca = true;
	var verificaInicio = false;

	var msgInicio = new Text("Courier", 30, "black");
	var msg = new Text("Courier", 25, "black");

	function atira(){
		//ball2.pos = {x: shooter2.ballPos.x, y: shooter2.ballPos.y+shooter2.size.h}; // marca a posicao da bala
		//ball2.setVelocityVector(shooter2.center); // ajusta a velocidade da bala
		shots2.push(ball2); // adiciona a bala no vetor de tiros
		ball2 = null; // apaga a bala auxiliar
		shoot2 = true;// bloqueia a repeticao do tiro
	}

	function carrega(){
		//ball2 = new Shot(shooter2.ballPos.x, shooter2.ballPos.y, 325, 0, 12, 1);// prepara a nova bala
		//shoot2 = false;
	}
	//reset do jogo
	function reset() {
		ctx.clearRect(0, 0, WIDTH, HEIGHT);// limpa a tela do jogo
		// limpa os tiros da tela
		shots.length = 0;
		shots2.length = 0;
		if(!recomeca){
				msg.raster(ctx, "Game over!", WIDTH/8, HEIGHT/4);
				msg.raster(ctx, "Aperte R para continuar", WIDTH/6, HEIGHT/2 );
			}
		verificaInicio = true;
		//reposiciona a nave
		var spawn = WIDTH*Math.random()*Math.random();

		shooter1.center = {x: WIDTH/2, y: HEIGHT/6};

		shooter1.reset();//volta as propriedades do shooter ao padrao do inicio
		ganhador = 0;
		bar.energy = 1.0;
	}; reset();
	//regra do jogo
	var loop = function() {
		if(inicio && !pause && recomeca){
		ctx.clearRect(0, 0, WIDTH, HEIGHT);

		//texto da tela do jogo
		texto.raster(ctx, "Vida:", 10, 20);
		texto.raster(ctx, "Pontos: " + shooter1.pontos, 10, 40);

		//controle visual da barra de vida
		ctx.strokeStyle = "#a0afa1";//Controla a borda
		if(bar.energy<=0.2){//Controla a cor
			texto.raster(ctx, "Vida baixa!", bar.size.w/2, 20);
			ctx.fillStyle = "#ff1000";
		}else if(bar.energy>0.2 && bar.energy<=0.4){
			ctx.fillStyle = "#a51309";
		}else if(bar.energy>0.4 && bar.energy<=0.7){
			ctx.fillStyle = "#e1ff00";
		}else if(bar.energy>0.7 && bar.energy<=0.9){
			ctx.fillStyle = "#ff9000";
		}else {
			ctx.fillStyle = "#00ff15";
		}

		ctx.fillRect(bar.pos.x, bar.pos.y, bar.energy * bar.size.w, bar.size.h);
    ctx.strokeRect(bar.pos.x, bar.pos.y, bar.size.w, bar.size.h);

		//instancia novos bots
		criaBot();
		//Verifica colisao dos tiros com o bot
		for(var i = 0; i < shots.length; i++){
			for (var j = 0; j < bots.length; j++) {
				if(((shots[i].pos.x >= bots[j].center.x-bots[j].size.w) && (shots[i].pos.x <= bots[j].center.x+bots[j].size.w)) &&
				((shots[i].pos.y >= bots[j].center.y-bots[j].size.h) && (shots[i].pos.y <= bots[j].center.y+bots[j].size.h))) {
					//shooter2.life--;
					bots[j].center.y = 0;
					shots.splice(i, 1);//apaga os tiros que colidiram
					bots.splice(j, 1);
					shooter1.pontos++;
					break;
				}
			}
		}

		//contadores para o for do tiro
		var cont, cont2;
		//tiros player 1
		for(cont = 0; cont < shots.length; cont++) {
			shots[cont].move(DT, G);
			//Apaga os tiros que saem da tela
			if(shots[cont].pos.y < 0 || shots[cont].pos.x < 0 || shots[cont].pos.x > WIDTH || shots[cont].pos.y > HEIGHT){// impõe limites
				shots.splice(cont, 1);// remove o tiro do vetor
				//verificaPontos1 = false;// liga novamente o contador
			}
		}
		//tiros player 2
		for(cont2 = 0; cont2 < shots2.length; cont2++) {
			shots2[cont2].move(DT, G);
			//Apaga os tiros que saem da tela
			if(shots2[cont2].pos.y < 0 || shots2[cont2].pos.x < 0 || shots2[cont2].pos.x > WIDTH || shots2[cont2].pos.y > HEIGHT){// impõe limites
				shots2.splice(cont2, 1);// remove o tiro do vetor
			//verificaPontos2 = false;// liga novamente o contador
			}
		}
		//Movimenta as naves
		shooter1.move(DT);
		moverBot();

		//desenha os tiros na tela
		shots.forEach( function(shot) { shot.draw(ctx); } );
		shots2.forEach( function(shot2) { shot2.draw(ctx); } );
		//desenha as naves na tela
		shooter1.draw(ctx);
		//shooter2.draw(ctx);

		if(bar.energy <= 0.0){// fim de jogo
			recomeca = false;
			reset();
		}

		/*if (shooter1.pontos >= PTSMAX || shooter2.pontos >= PTSMAX) { // fim de jogo
			//verifica quem ganhou
			if (shooter1.pontos >= PTSMAX) {
				ganhador = 1;
			}if (shooter2.pontos >= PTSMAX) {
				ganhador = 2;
			}
			recomeca = false;
			reset();
		}*/
	}else if(!inicio){// exibe a mensagem da tela inicial
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		msgInicio.raster(ctx, "Aperte ENTER para começar", 25, HEIGHT/2 );
	}else if(pause){// exibe a mensagem de jogo pausado
		msg.raster(ctx, "Aperte P para continuar", (WIDTH/6), HEIGHT/2 );
	}
}

	setInterval(loop, 1000/FPS);
	//controles do jogo
	addEventListener("keydown", function(e){
		if(e.keyCode == 32 && !shoot) { // Espaco, tiro player 1
			ball.pos = {x: shooter1.ballPos.x, y: (shooter1.ballPos.y)}; // marca a posicao da bala
			ball.setVelocityVector(shooter1.center); // ajusta a velocidade da bala
			shots.push(ball); // adiciona a bala no vetor de tiros
			ball = null; // apaga a bala auxiliar
			shoot = true;// bloqueia a repeticao do tiro
			e.preventDefault();
		}if(e.keyCode == 37){ // esquerda player 1
			shooter1.vx = -100;
			e.preventDefault();
		}if(e.keyCode == 39){ // direita player 1
			shooter1.vx = 100;
			e.preventDefault();
		}if (e.keyCode == 38) { // cima player 1
			shooter1.vy = -100;
			e.preventDefault();
    }if (e.keyCode == 40) { // baixo player 1
			shooter1.vy = 100;
			e.preventDefault();
    }
    if(e.keyCode == 13){// Enter
			inicio = true;
			e.preventDefault();
		}if(e.keyCode == 80){// P
				pause = !pause;
		}if (e.keyCode == 82) {// R
				recomeca = true;
		}
		/*if (e.keyCode == 87) {// W
			shooter2.vy = -100;
			e.preventDefault();
		}
		if (e.keyCode == 83) {// S
			shooter2.vy = 100;
			e.preventDefault();
		}
		if (e.keyCode == 65) {// A
			shooter2.vx = -100;
			e.preventDefault();
		}
		if (e.keyCode == 68) {// D
			shooter2.vx = 100;
			e.preventDefault();
		}*/
		if (e.keyCode == 16){// Shift Esq
			atira();
			e.preventDefault();
		}
	});

	addEventListener("keyup", function(e){
		if(e.keyCode == 32) { // Espaco player 1
			ball = new Shot(shooter1.ballPos.x, shooter1.ballPos.y, 325, 0, 12, 1);// prepara a nova bala
			shoot = false;
		}
		if(e.keyCode == 37 || e.keyCode == 39){ //esquerda e direita player 1
			shooter1.ax = 0;
			shooter1.vx = 0;
		}
		if (e.keyCode == 38 || e.keyCode == 40) { //cima e baixo player 1
      shooter1.ay = 0;
			shooter1.vy = 0;
    }
		/*if (e.keyCode == 87 || e.keyCode == 83) {// W e S
			shooter2.vy = 0;
		}
		if (e.keyCode == 65 || e.keyCode == 68) {// A e D
			shooter2.vx = 0;
		}*/
		if (e.keyCode == 16) {// Shift Esq
			carrega();
		}
	});
}
