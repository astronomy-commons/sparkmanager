from setuptools import setup, find_packages

setup(
    name='SparkManager',
    version='0.1.0',
    #author='An Awesome Coder',
    #author_email='aac@example.com',
    packages=find_packages(),
    #url='http://pypi.python.org/pypi/PackageName/',
    #license='LICENSE.txt',
    description='Manage spark applications and clusters',
    #long_description=open('README.txt').read(),
    install_requires=[
#        "pyspark",
    ],
	include_package_data=True,
	package_data={
		"" : [
			"nbextension/*",
		]
	},
)

