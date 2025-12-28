import { _k } from "../shared";

export const quit = () => {
    const { app, gfx, ggl, gc } = _k;

    app.events.onOnce("frameEnd", () => {
        app.quit();

        // clear canvas
        gfx.gl.clear(
            gfx.gl.COLOR_BUFFER_BIT | gfx.gl.DEPTH_BUFFER_BIT
                | gfx.gl.STENCIL_BUFFER_BIT,
        );

        // unbind everything
        const numTextureUnits = gfx.gl.getParameter(
            gfx.gl.MAX_TEXTURE_IMAGE_UNITS,
        );

        for (let unit = 0; unit < numTextureUnits; unit++) {
            gfx.gl.activeTexture(gfx.gl.TEXTURE0 + unit);
            gfx.gl.bindTexture(gfx.gl.TEXTURE_2D, null);
            gfx.gl.bindTexture(gfx.gl.TEXTURE_CUBE_MAP, null);
        }

        gfx.gl.bindBuffer(gfx.gl.ARRAY_BUFFER, null);
        gfx.gl.bindBuffer(gfx.gl.ELEMENT_ARRAY_BUFFER, null);
        gfx.gl.bindRenderbuffer(gfx.gl.RENDERBUFFER, null);
        gfx.gl.bindFramebuffer(gfx.gl.FRAMEBUFFER, null);

        // run all scattered gc events
        ggl.destroy();
        gc.forEach((f) => f());

        // remove canvas
        app.canvas.remove();
    });
};

export const onCleanup = (action: () => void) => {
    _k.gc.push(action);
};
