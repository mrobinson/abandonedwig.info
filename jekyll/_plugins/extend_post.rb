require 'pathname'

module Jekyll

    class Document
      alias_method :original_to_liquid, :to_liquid

      def to_liquid
        data = original_to_liquid
        basename = Pathname.new(@path).basename
        data['filename'] = basename.to_s
        data['basename_no_ext'] = basename.sub_ext('').to_s
        data['images_dir'] = "/images/" + data['basename_no_ext']
        return data
      end
    end

end
