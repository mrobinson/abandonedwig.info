require 'pathname'

module Jekyll

    class Document
      alias_method :original_to_liquid, :to_liquid

      def to_liquid
        data = original_to_liquid
        data['filename'] = Pathname.new(@path).basename.to_s
        return data
      end
    end

end
