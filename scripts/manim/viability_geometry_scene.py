from manim import *

BACKGROUND = ManimColor.from_rgb((7 / 255, 17 / 255, 31 / 255))
LIGHT_SKY_BLUE = ManimColor.from_rgb((135 / 255, 206 / 255, 250 / 255))
DEEP_SKY_BLUE = ManimColor.from_rgb((0 / 255, 191 / 255, 255 / 255))
TEXT = ManimColor.from_rgb((234 / 255, 241 / 255, 248 / 255))
MUTED = ManimColor.from_rgb((158 / 255, 176 / 255, 195 / 255))

class ViabilityGeometryScene(Scene):
    """Publication animation of the same normalized service geometry used by the browser lab."""

    def construct(self):
        self.camera.background_color = BACKGROUND

        axes = Axes(
            x_range=[0.35, 1.05, 0.1],
            y_range=[0.35, 1.05, 0.1],
            x_length=7.0,
            y_length=5.2,
            axis_config={"color": MUTED, "stroke_width": 1.5},
            tips=False,
        )
        x_label = MathTex("p", color=TEXT).next_to(axes.x_axis, RIGHT)
        y_label = MathTex("m", color=TEXT).next_to(axes.y_axis, UP)

        region_coordinates = [
            (0.45, 0.75),
            (0.45, 1.00),
            (1.00, 1.00),
            (1.00, 0.45),
            (0.75, 0.45),
        ]
        region = Polygon(
            *[axes.c2p(p, m) for p, m in region_coordinates],
            color=LIGHT_SKY_BLUE,
            fill_color=LIGHT_SKY_BLUE,
            fill_opacity=0.10,
            stroke_width=2.0,
        )

        p_floor = Line(axes.c2p(0.45, 0.35), axes.c2p(0.45, 1.0), color=LIGHT_SKY_BLUE)
        m_floor = Line(axes.c2p(0.35, 0.45), axes.c2p(1.0, 0.45), color=LIGHT_SKY_BLUE)
        service = Line(axes.c2p(0.45, 0.75), axes.c2p(0.75, 0.45), color=DEEP_SKY_BLUE, stroke_width=4)

        p, m, psi = 0.78, 0.72, 1.35
        state = Dot(axes.c2p(p, m), radius=0.075, color=DEEP_SKY_BLUE)
        state_label = MathTex(r"Y=(0.78,0.72)", color=TEXT).scale(0.65).next_to(state, UR, buff=0.15)

        radius = 0.065
        x_scale = axes.x_axis.get_unit_size()
        y_scale = axes.y_axis.get_unit_size()
        metric_ball = Ellipse(
            width=2 * radius * x_scale,
            height=2 * (radius / psi) * y_scale,
            color=LIGHT_SKY_BLUE,
            stroke_width=2,
        ).move_to(state.get_center())

        equations = VGroup(
            MathTex(r"g_\psi=dp^2+\psi^2dm^2", color=TEXT),
            MathTex(r"K_{\mathrm{svc}}=\{p\ge0.45,\;m\ge0.45,\;p+m\ge1.20\}", color=TEXT),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.25).scale(0.65).to_corner(UL)

        self.play(Create(axes), FadeIn(x_label, y_label))
        self.play(FadeIn(region), Create(p_floor), Create(m_floor), Create(service))
        self.play(Write(equations))
        self.play(FadeIn(metric_ball), FadeIn(state), Write(state_label))
        self.wait(1)

        target = axes.c2p(0.64, 0.60)
        self.play(
            state.animate.move_to(target),
            metric_ball.animate.move_to(target),
            state_label.animate.next_to(target, UR, buff=0.15),
            run_time=2.5,
            rate_func=smooth,
        )
        self.wait(1)
