from PIL import Image

# Usa ../ per tornare alla cartella principale, e assicurati di usare .png
img = Image.open('../public/images/point_.jpg')

# Salva il file nella stessa cartella
img.save('../public/images/point_.webp', 'webp', optimize=True, quality=80)