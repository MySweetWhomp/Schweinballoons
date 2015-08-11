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

        // viewport must follow the player
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        this.body.setVelocity(2, 9);

        this.name = 'player';

        // we always update the player, ALWAYS
        this.alwaysUpdate = true;

        this.onAirTime = 100;

        this.JUMP_MAX_AIRBONRNE_TIME = 30;
    },

    /**
     * update the entity
     */
    update : function (dt) {
        if (me.input.isKeyPressed('left')) {
            this.renderable.flipX(true);
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
        } else if (me.input.isKeyPressed('right')) {
            this.renderable.flipX(false);
            this.body.vel.x += this.body.accel.x * me.timer.tick;
        } else {
            this.body.vel.x = 0;
        }

        if (me.input.isKeyPressed('up')) {
            if (!this.body.jumping &&
                (!this.body.falling ||
                 this.onAirTime < this.JUMP_MAX_AIRBONRNE_TIME)) {
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                this.body.jumping = true;
            }
        }

        this.onAirTime += dt;
        if (!this.body.falling) {
            this.onAirTime = 0;
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        if (other.name === 'ball') {
            return false;
        }
        // Make all other objects solid
        return true;
    }
});
