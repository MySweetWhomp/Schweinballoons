/**
 * Player Entity
 */
game.PlayerEntity = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        this.name = 'player';

        // viewport must follow the player
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        // we set the velocity of the player's body
        this.body.setVelocity(2, 9);

        // we always update the player, ALWAYS
        this.alwaysUpdate = true;

        // setting constants related to jumping
        this.onAirTime = 100;
        this.JUMP_MAX_AIRBONRNE_TIME = 80;

        // setting initial direction
        this.direction = new me.Vector2d(1, 0);
        this.knockbacked = false;

        // animations
        this.renderable.addAnimation('idle', [0, 1, 2], 150);
        this.renderable.addAnimation('walk', [3, 4, 5, 6, 7, 8], 100);
        this.renderable.addAnimation('run', [9, 10, 11, 12, 13, 14], 70);
        this.renderable.addAnimation('jump', [15, 16], 50);
        this.renderable.addAnimation('fall', [18, 19], 50);
        this.renderable.addAnimation('kick', [20, 21, 21, 21, 22, 22], 50);
        this.renderable.addAnimation('stun', [23, 24, 23, 24, 23, 24], 50); // Must blink
        this.renderable.addAnimation('win', [25, 26, 27, 26], 120);
        this.setCurrentAnimation('idle');
    },

    setCurrentAnimation: function(name, onComplete) {
        if (!this.renderable.isCurrentAnimation(name)) {
            this.renderable.setCurrentAnimation(name, onComplete);
        }
    },

    /**
     * knocks the player back
     */
     knockback: function (strength) {
       // set default strength
       strength = strength || 4;

       // change the velocity
       this.body.vel.add(new me.Vector2d(-strength * this.direction.x, -strength));

       // set state as currently knockbacked
       this.knockbacked = true;
     },

     /**
      * kicks something
      */
     kick: function(){
       this.setCurrentAnimation('kick');
       this.kicking = true;
     },

    /**
     * update the entity
     */
    update : function (dt) {
        // handling movement on the side
        if (me.input.isKeyPressed('left')) {
            this.renderable.flipX(true);
            this.body.vel.x -= this.body.accel.x * me.timer.tick * (this.knockbacked ? 0.0 : 1);
            this.direction = new me.Vector2d(-1, 0);
        } else if (me.input.isKeyPressed('right')) {
            this.renderable.flipX(false);
            this.body.vel.x += this.body.accel.x * me.timer.tick * (this.knockbacked ? 0.0 : 1);
            this.direction = new me.Vector2d(1, 0);
        } else if(!this.knockbacked) {
            this.body.vel.x = 0;
        }

        //TODO : remove, just for debug purposes
        if (me.input.isKeyPressed('e')) {
          this.knockback();
        }

        //handling jump
        if (me.input.isKeyPressed('up')) {
            if (!this.body.jumping &&
                (!this.body.falling ||
                 this.onAirTime < this.JUMP_MAX_AIRBONRNE_TIME)) {
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                this.body.jumping = true;
            }
        }
        this.onAirTime += dt;
        if (!this.body.falling && !this.body.jumping) {
            this.onAirTime = 0;
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // enable kicking
        if(me.input.isKeyPressed('a')) {
          if(!this.kicking) {
              this.kick();
          }
        }
        if(this.kicking &&
           this.renderable.isCurrentAnimation('kick') &&
           this.renderable.getCurrentAnimationFrame() == 5)
        {
          this.renderable.setAnimationFrame(0);
          this.kicking = false;
        }

        // update animation
        if(!this.kicking){
          if (this.body.jumping) {
              this.setCurrentAnimation('jump');
          } else if (this.body.falling) {
              this.setCurrentAnimation('fall');
          } else if (this.body.vel.x !== 0) {
              this.setCurrentAnimation('walk');
          } else {
              this.setCurrentAnimation('idle');
          }
        }

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {

        //we're not knockbacked anymore
        this.knockbacked = false;

        if (other.name === 'ball') {
            // TODO if jumping ON the ball, must actually `return true` to have a collision
            return false;
        }
        // Make all other objects solid
        return true;
    }
});
