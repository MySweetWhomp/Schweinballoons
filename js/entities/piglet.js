/**
 * Piglet Entity
 */
game.PigletEntity = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {
        settings.image = 'piglet';
        settings.framewidth = 26;
        settings.frameheight = 32;
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        this.name = 'piglet';

        this.renderable.translate(0, -8);

        // we set the velocity of the player's body
        this.body.setVelocity(0, 0);

        // we always update the piglets, ALWAYS
        this.alwaysUpdate = true;

        // we set initial values
        this.rescued = false;

        // animations
        this.renderable.addAnimation('kidnapped', [0, 1, 2, 3], 100);
        this.renderable.addAnimation('freed', [4, 5, 6, 7], 100);
        this.setCurrentAnimation('kidnapped');
    },

    setCurrentAnimation: function(name, onComplete) {
        if (!this.renderable.isCurrentAnimation(name)) {
            this.renderable.setCurrentAnimation(name, onComplete);
        }
    },

    rescue: function() {
        this.setCurrentAnimation('freed');

        if(!this.rescued) {
            me.game.world.getChildByName('HUD')[0].pigletRescued();
            this.rescued = true;
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
