# frozen_string_literal: true

class Ui::WhatsappButtonComponent < ViewComponent::Base
  def initialize(phone_number: nil, message: nil)
    super
    @phone_number = phone_number
    @message = message
  end

  private

  attr_reader :phone_number, :message

  def whatsapp_url
    base_url = "https://wa.me/"
    base_url += phone_number if phone_number
    base_url += "?text=#{CGI.escape(message)}" if message
    base_url
  end
end