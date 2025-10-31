# frozen_string_literal: true

class Ui::ColorBendsComponent < ViewComponent::Base
  def initialize(colors: ["#ff5c7a", "#8a5cff", "#00ffd1"], rotation: 45, speed: 0.2, 
                 transparent: true, auto_rotate: 0, scale: 1, frequency: 1, warp_strength: 1,
                 mouse_influence: 1, parallax: 0.5, noise: 0.1, **html_options)
    @colors = colors
    @rotation = rotation
    @speed = speed
    @transparent = transparent
    @auto_rotate = auto_rotate
    @scale = scale
    @frequency = frequency
    @warp_strength = warp_strength
    @mouse_influence = mouse_influence
    @parallax = parallax
    @noise = noise
    @html_options = html_options
  end

  private

  attr_reader :colors, :rotation, :speed, :transparent, :auto_rotate, :scale, :frequency, 
              :warp_strength, :mouse_influence, :parallax, :noise, :html_options

  def container_classes
    classes = ["color-bends-container", "w-full", "h-full", "relative", "overflow-hidden"]
    classes << html_options[:class] if html_options[:class]
    classes.join(" ")
  end

  def stimulus_data
    {
      controller: "color-bends",
      "color-bends-colors-value": colors.to_json,
      "color-bends-rotation-value": rotation,
      "color-bends-speed-value": speed,
      "color-bends-transparent-value": transparent,
      "color-bends-auto-rotate-value": auto_rotate,
      "color-bends-scale-value": scale,
      "color-bends-frequency-value": frequency,
      "color-bends-warp-strength-value": warp_strength,
      "color-bends-mouse-influence-value": mouse_influence,
      "color-bends-parallax-value": parallax,
      "color-bends-noise-value": noise
    }
  end
end