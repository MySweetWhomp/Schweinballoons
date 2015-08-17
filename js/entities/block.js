/**
 * Block Entity
 */
game.BlockEntity = me.Entity.extend({

    /**
     * constructor
     */
    init: function (x, y, settings) {
        settings.image = 'block';
        settings.framewidth = 24;
        settings.frameheight = 24;

        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        this.name = 'block';

        // we set the velocity of the player's body
        this.body.setVelocity(0, 0);
        this.body.setMaxVelocity(0, 0);
        this.body.gravity = 0;
        this.body.collisionType = me.collision.types.WORLD_SHAPE;

        // we always update the piglets, ALWAYS
        this.alwaysUpdate = true;

        this.renderable.addAnimation('base', [0]);
        this.renderable.addAnimation('break', [1, 2]);
        this.renderable.setCurrentAnimation('base');
    },

    break: function() {
        //break the block
        if (!this.renderable.isCurrentAnimation('break')) {
            this.renderable.setCurrentAnimation('break', function() {
                me.game.world.removeChild(this);
            }.bind(this));
        }
    },

    /**
     * update the entity
     */
    update : function (dt) {
        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]));
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        return false;
    }
});
