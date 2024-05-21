// This file is auto-generated by ./bin/rails stimulus:manifest:update
// Run that command whenever you add a new controller or create them with
// ./bin/rails generate stimulus controllerName

import { application } from "./application"

import HelloController from "./hello_controller"
application.register("hello", HelloController)

import PhoneNumberController from "./phone_number_controller"
application.register("phone-number", PhoneNumberController)

import MenuController from "./menu_controller"
application.register("menu", MenuController)

import Notification from "stimulus-notification"
application.register('notification', Notification)

import AnimatedNumber from '@stimulus-components/animated-number'
application.register('animated-number', AnimatedNumber)

