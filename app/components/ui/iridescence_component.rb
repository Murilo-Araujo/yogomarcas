# frozen_string_literal: true

class Ui::IridescenceComponent < ViewComponent::Base
  def initialize(color: [1, 1, 1], speed: 1.0, amplitude: 0.1, mouse_react: true, **html_options)
    @color = color
    @speed = speed
    @amplitude = amplitude
    @mouse_react = mouse_react
    @html_options = html_options
  end

  private

  attr_reader :color, :speed, :amplitude, :mouse_react, :html_options

  def container_classes
    classes = ["iridescence-container"]
    classes << html_options[:class] if html_options[:class]
    classes.join(" ")
  end

  def stimulus_data
    {
      controller: "iridescence",
      "iridescence-color-value": color.to_json,
      "iridescence-speed-value": speed,
      "iridescence-amplitude-value": amplitude,
      "iridescence-mouse-react-value": mouse_react
    }
  end
end
