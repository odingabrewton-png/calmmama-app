require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'CalmmamaDevMenu'
  s.version        = package['version']
  s.summary        = 'CalmMama dev-menu helpers'
  s.license        = 'MIT'
  s.author         = 'CalmMama'
  s.homepage       = 'https://github.com/odingaa/calmmama-app'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'expo-dev-menu'

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
